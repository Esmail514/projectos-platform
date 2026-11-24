// Comprehensive E2E Authentication & RBAC Test Suite
const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=== STARTING PROJECTOS AUTH & RBAC VERIFICATION ===\n");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Super Admin Login
    console.log("1. Authenticating as Super Admin (admin@projectos.io)...");
    const adminLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@projectos.io",
        password: "SuperAdmin123!",
      }),
    });
    const adminLoginData = await adminLoginRes.json();
    assert(adminLoginRes.status === 200 && adminLoginData.success, "Super Admin logged in successfully (200 OK)");
    assert(adminLoginData.user?.role === "SUPER_ADMIN", "Super Admin role is verified");
    assert(adminLoginData.token != null, "JWT Session Token generated and returned");
    assert(adminLoginData.user?.apiKey?.startsWith("pos_"), "User possesses API Key (pos_...)");

    const adminToken = adminLoginData.token;
    const adminApiKey = adminLoginData.user.apiKey;

    // 2. Test /api/v1/auth/me as Super Admin
    console.log("\n2. Verifying /api/v1/auth/me session & permissions...");
    const meRes = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const meData = await meRes.json();
    assert(meData.authenticated === true, "Session authenticated via Bearer token");
    assert(meData.permissions?.manage_users === true, "Super Admin has manage_users permission");
    assert(meData.permissions?.execute_sql === true, "Super Admin has execute_sql permission");
    assert(meData.permissions?.create_project === true, "Super Admin has create_project permission");
    assert(meData.permissions?.manage_alerts === true, "Super Admin has manage_alerts permission");

    // 3. Login as Viewer
    console.log("\n3. Authenticating as Viewer (viewer@projectos.io)...");
    const viewerLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "viewer@projectos.io",
        password: "ViewerPassword123!",
      }),
    });
    const viewerLoginData = await viewerLoginRes.json();
    assert(viewerLoginRes.status === 200 && viewerLoginData.success, "Viewer logged in successfully");
    assert(viewerLoginData.user?.role === "VIEWER", "Viewer role is verified");
    const viewerToken = viewerLoginData.token;
    const viewerId = viewerLoginData.user.id;

    // 4. Test Viewer Permission Restrictions (Must be blocked 403)
    console.log("\n4. Testing Viewer Restrictions (Must get 403 Forbidden)...");
    
    // 4a. Viewer attempts to create project
    const projRes = await fetch(`${BASE_URL}/api/v1/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${viewerToken}`,
      },
      body: JSON.stringify({
        name: "Unauthorized Project",
        slug: "unauthorized-project",
      }),
    });
    assert(projRes.status === 403, "Viewer blocked from creating projects (403 Forbidden)");

    // 4b. Viewer attempts to access users management list
    const usersRes = await fetch(`${BASE_URL}/api/v1/users`, {
      headers: { Authorization: `Bearer ${viewerToken}` },
    });
    assert(usersRes.status === 403, "Viewer blocked from accessing users management (403 Forbidden)");

    // 4c. Viewer attempts raw SQL execution
    const sqlRes = await fetch(`${BASE_URL}/api/v1/projects/demo/sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${viewerToken}`,
      },
      body: JSON.stringify({ query: "SELECT 1;" }),
    });
    assert(sqlRes.status === 403, "Viewer blocked from executing raw SQL (403 Forbidden)");

    // 4d. Viewer can read public/allowed projects
    const listProjRes = await fetch(`${BASE_URL}/api/v1/projects`, {
      headers: { Authorization: `Bearer ${viewerToken}` },
    });
    assert(listProjRes.status === 200, "Viewer permitted to read projects list (200 OK)");

    // 5. Super Admin creates a new custom user
    console.log("\n5. Super Admin creates a new user with custom permissions...");
    const newUserEmail = `analyst_${Date.now()}@projectos.io`;
    const createUserRes = await fetch(`${BASE_URL}/api/v1/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        email: newUserEmail,
        name: "Data Analyst",
        password: "AnalystPassword123!",
        role: "VIEWER",
        permissions: {
          execute_sql: true,
          view_monitoring: true,
        },
      }),
    });
    const createUserData = await createUserRes.json();
    assert(createUserRes.status === 201 && createUserData.success, "New user created by Super Admin (201 Created)");

    // 6. Test Granular Permission Elevation (ABAC override) on Viewer
    console.log("\n6. Granting custom permission (execute_sql: true) to Viewer...");
    const patchRes = await fetch(`${BASE_URL}/api/v1/users/${viewerId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        permissions: {
          execute_sql: true,
        },
      }),
    });
    const patchData = await patchRes.json();
    assert(patchRes.status === 200 && patchData.success, "Viewer granted execute_sql permission override");

    // Re-test SQL execution as Viewer - should now be permitted!
    const elevatedSqlRes = await fetch(`${BASE_URL}/api/v1/projects/demo/sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${viewerToken}`,
      },
      body: JSON.stringify({ query: "SELECT 'RBAC Override Succeeded' as status;" }),
    });
    const elevatedSqlData = await elevatedSqlRes.json();
    assert(elevatedSqlRes.status === 200 && elevatedSqlData.success, "Viewer with granted permission successfully executed raw SQL (200 OK)");

    // 7. Test API Key Authentication
    console.log("\n7. Testing API Key Authentication (x-api-key)...");
    const apiKeyProjRes = await fetch(`${BASE_URL}/api/v1/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": adminApiKey,
      },
      body: JSON.stringify({
        name: "Security Verified Project",
        slug: `security-verified-${Date.now()}`,
        description: "Created via x-api-key header authentication",
        dbType: "postgresql",
      }),
    });
    assert(apiKeyProjRes.status === 201, "Created project via x-api-key without cookie or Bearer token (201 Created)");

    // 8. Test Logout
    console.log("\n8. Testing Logout...");
    const logoutRes = await fetch(`${BASE_URL}/api/v1/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const logoutData = await logoutRes.json();
    assert(logoutRes.status === 200 && logoutData.success, "Session invalidated successfully upon logout (200 OK)");

    console.log(`\n========================================`);
    console.log(`=== ALL TESTS COMPLETED: ${passed} PASSED, ${failed} FAILED ===`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test error:", err);
    process.exit(1);
  }
}

runTests();
