const fs = require("fs");
const readline = require("readline");
const path = require("path");
const { exec } = require("child_process");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("\n🔧 Setup: Authentication Backend Configuration");
console.log("Would you like to include the example backend?");
console.log("1) ✅ Yes, include the example backend.");
console.log("2) ❌ No, I will write my own backend.");
console.log("3) 🛑 Cancel setup (I have not read the README).\n");

rl.question("Select an option (1/2/3): ", (answer) => {
  if (answer === "1") {
    console.log("\n✅ Keeping example backend.");
    updateAuthProvider();
  } else if (answer === "2") {
    console.log("\n❌ Removing example backend...");
    removeExampleServer();
  } else {
    console.log(
      "\n🛑 Setup canceled. Please read the README and run this script again with 'npm run setup'.",
    );
    rl.close();
    return;
  }
  rl.close();
});

function updateAuthProvider() {
  const authProviderPath = path.join("providers", "auth-provider.tsx");

  if (!fs.existsSync(authProviderPath)) {
    console.warn("⚠️ auth-provider.tsx not found, skipping update.");
    return;
  }

  let content = fs.readFileSync(authProviderPath, "utf8");

  // remove all console.log statements
  content = content.replace(/console\.log\([\s\S]*?\);/g, "");

  // process EXAMPLE blocks: we remove marker lines, example comments, and block comment markers
  content = content.replace(
    /[ \t]*\/\/\s*<EXAMPLE:([A-Z_]+)>\s*\n([\s\S]*?)[ \t]*\/\/\s*<\/EXAMPLE:\1>\s*\n?/gm,
    (match, marker, inner) => {
      let code = inner.replace(
        /^[ \t]*\/\/\s*Example request - replace with your actual backend call\s*\n?/gm,
        "",
      );
      code = code.replace(/^[ \t]*\/\*\s*\n?/gm, "");
      code = code.replace(/[ \t]*\*\/\s*\n?/gm, "");
      return code;
    },
  );

  // remove PLACEHOLDER blocks
  content = content.replace(
    /[ \t]*\/\/\s*<PLACEHOLDER:[\w_]+>[\s\S]*?[ \t]*\/\/\s*<\/PLACEHOLDER:[\w_]+>\n?/gm,
    "",
  );

  fs.writeFileSync(authProviderPath, content, "utf8");
  console.log("✅ Example requests updated in auth-provider.tsx.");

  // Format the file
  exec(`npx prettier --write ${authProviderPath}`, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Prettier formatting failed.");
    }
  });
}

function removeExampleServer() {
  const exampleServerPath = path.join(__dirname, "example-server");

  fs.rm(exampleServerPath, { recursive: true, force: true }, (err) => {
    if (err) {
      console.error("❌ Error removing example-server.");
    } else {
      console.log("✅ example-server removed successfully.");
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
        "utf8",
      );
    }
  }
}
