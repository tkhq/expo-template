const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { exec } = require("child_process");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function displaySetupOptions() {
  console.log("\n🔧 Setup: Backend Configuration");
  console.log("Would you like to include the example backend?");
  console.log("1) ✅ Yes, include the example backend");
  console.log("2) ❌ No, I will write my own backend");
  console.log("3) 🛑 Cancel setup (I have not read the README)\n");

  rl.question("Select an option (1/2/3): ", (answer) => {
    switch (answer) {
      case "1":
        includeExampleBackend();
        break;
      case "2":
        excludeExampleBackend();
        break;
      case "3":
      default:
        cancelSetup();
        break;
    }
  });
}

function includeExampleBackend() {
  console.log("\n✅ Keeping example backend.");
  applyExampleBackendUpdates();
  cleanup();

  rl.close();
}

function excludeExampleBackend() {
  console.log("\n❌ Removing example backend...");
  deleteExampleServerFolder();
  stripExampleBackendMarkers();
  cleanup();

  rl.close();
}

function cancelSetup() {
  console.log(
    "\n🛑 Setup canceled. Please read the README and run this script again with 'npm run setup'."
  );
  rl.close();
}

function applyExampleBackendUpdates() {
  const authProviderPath = path.join("providers", "auth-provider.tsx");

  if (!fs.existsSync(authProviderPath)) {
    console.warn("⚠️ auth-provider.tsx not found, skipping update.");
    return;
  }

  let content = fs.readFileSync(authProviderPath, "utf8");

  // remove all console.log statements
  content = content.replace(/console\.log\([\s\S]*?\);/g, "");

  // process EXAMPLE blocks: remove marker lines, example comments, and block comment markers
  content = content.replace(
    /[ \t]*\/\/\s*<EXAMPLE:([A-Z_]+)>\s*\n([\s\S]*?)[ \t]*\/\/\s*<\/EXAMPLE:\1>\s*\n?/gm,
    (match, marker, inner) => {
      let code = inner.replace(
        /^[ \t]*\/\/\s*Example request - replace with your actual backend call\s*\n?/gm,
        ""
      );
      code = code.replace(/^[ \t]*\/\*\s*\n?/gm, "");
      code = code.replace(/[ \t]*\*\/\s*\n?/gm, "");
      return code;
    }
  );

  // remove PLACEHOLDER blocks completely
  content = content.replace(
    /[ \t]*\/\/\s*<PLACEHOLDER:[\w_]+>[\s\S]*?[ \t]*\/\/\s*<\/PLACEHOLDER:[\w_]+>\n?/gm,
    ""
  );

  fs.writeFileSync(authProviderPath, content, "utf8");
  console.log("✅ Example requests updated in auth-provider.tsx.");

  // format the file with Prettier
  exec(`npx prettier --write ${authProviderPath}`, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Prettier formatting failed.");
    }
  });
}

function stripExampleBackendMarkers() {
  const authProviderPath = path.join("providers", "auth-provider.tsx");

  if (!fs.existsSync(authProviderPath)) {
    console.warn("⚠️ auth-provider.tsx not found, skipping update.");
    return;
  }

  let content = fs.readFileSync(authProviderPath, "utf8");

  // find the import block and remove BACKEND_API_URL from the list
  content = content.replace(
    /(import\s*{)([^}]+)(}\s*from\s*['"][^'"]+['"])/,
    (match, start, importList, end) => {
      const filtered = importList
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "BACKEND_API_URL" && item.length > 0);
      return `${start} ${filtered.join(", ")} ${end}`;
    }
  );

  // remove the EXAMPLE block markers but keep the inner content
  content = content.replace(
    /([ \t]*)\/\/\s*<EXAMPLE:[A-Z_]+>\s*\n([\s\S]*?)[ \t]*\/\/\s*<\/EXAMPLE:[A-Z_]+>\s*\n?/gm,
    (match, indent, inner) => inner
  );

  // remove the PLACEHOLDER block markers but keep the inner content
  content = content.replace(
    /([ \t]*)\/\/\s*<PLACEHOLDER:[\w_]+>\s*\n([\s\S]*?)[ \t]*\/\/\s*<\/PLACEHOLDER:[\w_]+>\s*\n?/gm,
    (match, indent, inner) => inner
  );

  fs.writeFileSync(authProviderPath, content, "utf8");
  console.log("✅ Auth provider markers removed from auth-provider.tsx.");

  // format the file with Prettier
  exec(`npx prettier --write ${authProviderPath}`, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Prettier formatting failed.");
    }
  });
}

function deleteExampleServerFolder() {
  const exampleServerPath = path.join(__dirname, "example-server");

  fs.rm(exampleServerPath, { recursive: true, force: true }, (err) => {
    if (err) {
      console.error("❌ Error removing example-server folder.");
    } else {
      console.log("✅ example-server folder removed successfully.");
    }
  });
}

function cleanup() {
  const setupScriptPath = path.join(__dirname, "setup.js");
  fs.rm(setupScriptPath, { force: true }, (err) => {
    if (err) {
      console.error("❌ Error removing setup.js.");
    }
  });

  const packageJsonPath = path.join(__dirname, "package.json");
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    if (packageJson.scripts && packageJson.scripts.postinstall) {
      delete packageJson.scripts.postinstall;
      fs.writeFileSync(
        packageJsonPath,
        JSON.stringify(packageJson, null, 2),
        "utf8"
      );
    }
  }
}

displaySetupOptions();
