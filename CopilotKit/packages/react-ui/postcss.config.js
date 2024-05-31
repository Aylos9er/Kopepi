const path = require("path");
const fs = require("fs");

let didCreateInterface = false;

module.exports = {
  plugins: [
    {
      postcssPlugin: "postcss-collect-all-variables",
      Once(root) {
        if (didCreateInterface) return;

        const filename = path.basename(root.source.input.file);
        if (filename === "colors.css") {
          const variables = {};

          root.walkDecls((decl) => {
            if (decl.prop.startsWith("--")) {
              variables[decl.prop] = decl.value;
            }
          });

          // Create TypeScript interface
          const interfaceContent = generateInterface(variables);

          // Ensure the directory exists
          const dir = path.resolve(__dirname, "src/types");
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          // Write the interface to the file
          const filePath = path.resolve(dir, "css.ts");
          fs.writeFileSync(filePath, interfaceContent);

          didCreateInterface = true;
        }
      },
    },
    // require("tailwindcss"),
    // require("autoprefixer"),
  ],
};

function generateInterface(variables) {
  const interfaceLines = [
    'import { CSSProperties } from "react";',
    "",
    "export interface CopilotKitCSSProperties extends CSSProperties {",
  ];

  for (const [prop, value] of Object.entries(variables)) {
    interfaceLines.push(`  "${prop}"?: string;`);
  }

  interfaceLines.push("}");

  return interfaceLines.join("\n");
}
