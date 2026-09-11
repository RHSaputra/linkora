import { verifyRecaptcha } from "../src/lib/recaptcha";

async function runTests() {
  console.log("=======================================================");
  console.log("       GOOGLE reCAPTCHA v2 LOGIC VERIFICATION         ");
  console.log("=======================================================\n");

  let passed = 0;
  let total = 0;

  // Test 1: Bypass aman saat RECAPTCHA_SECRET_KEY belum diisi
  total++;
  const originalKey = process.env.RECAPTCHA_SECRET_KEY;
  const originalEnv = process.env.NODE_ENV;
  delete process.env.RECAPTCHA_SECRET_KEY;
  (process.env as any).NODE_ENV = "development";

  const resBypass = await verifyRecaptcha("any-fake-token");
  if (resBypass.success && resBypass.isBypassed) {
    console.log("  ✔ [PASSED] 1. Auto-bypass aman saat RECAPTCHA_SECRET_KEY kosong");
    passed++;
  } else {
    console.error("  ❌ [FAILED] 1. Auto-bypass gagal", resBypass);
  }

  // Test 2: Ditolak jika key aktif namun token kosong
  total++;
  process.env.RECAPTCHA_SECRET_KEY = "dummy_secret_key";
  (process.env as any).NODE_ENV = "production";

  const resEmptyToken = await verifyRecaptcha("");
  if (!resEmptyToken.success && resEmptyToken.error?.includes("centang")) {
    console.log("  ✔ [PASSED] 2. Token kosong ditolak dengan pesan centang reCAPTCHA");
    passed++;
  } else {
    console.error("  ❌ [FAILED] 2. Token kosong tidak ditolak dengan benar", resEmptyToken);
  }

  // Test 3: Token null ditolak
  total++;
  const resNullToken = await verifyRecaptcha(null);
  if (!resNullToken.success && resNullToken.error) {
    console.log("  ✔ [PASSED] 3. Token null ditolak dengan aman");
    passed++;
  } else {
    console.error("  ❌ [FAILED] 3. Token null tidak ditolak", resNullToken);
  }

  // Restore env
  if (originalKey !== undefined) {
    process.env.RECAPTCHA_SECRET_KEY = originalKey;
  } else {
    delete process.env.RECAPTCHA_SECRET_KEY;
  }
  (process.env as any).NODE_ENV = originalEnv;

  console.log("\n=======================================================");
  console.log(`   HASIL TEST RECAPTCHA: ${passed} / ${total} BERHASIL (${Math.round((passed / total) * 100)}%)   `);
  console.log("=======================================================\n");

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test Error:", err);
  process.exit(1);
});
