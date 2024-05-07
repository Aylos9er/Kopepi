import { AnnotatedDoc } from "./mdx";
import { SourceFile } from "./source";
import { Comments } from "./comments";
const fs = require("fs");

export class Documentation {
  constructor(private readonly annotation: AnnotatedDoc) {}

  async generate() {
    const generatedDocumentation = await this.generatedDocs();
    if (generatedDocumentation) {
      fs.writeFileSync(this.annotation.path, generatedDocumentation);
      console.log(`File ${this.annotation.path} written successfully`);
    }
  }

  async generatedDocs(): Promise<string | null> {
    const source = new SourceFile(this.annotation.sourcePath);
    await source.parse();

    const comment = Comments.getFirstCommentBlock(source.sourceFile);

    if (!comment) {
      console.warn(`No comment found for ${this.annotation.sourcePath}`);
      console.warn("Skipping...");
      return null;
    }

    const [description, ...rest] = comment.split("\n");
    const remarks = rest.join("\n");

    const arg0InterfaceDefinition = await source.getArg0Interface(this.annotation.name);

    let result: string = "";
    result += `---\n`;
    if (this.annotation.type === "component") {
      result += `title: "<${this.annotation.name} />"\n`;
    } else {
      result += `title: "${this.annotation.name}"\n`;
    }
    result += `description: "${description}"\n---\n\n`;
    result += `{/* GENERATE-DOCS ${this.annotation.comment} */}\n`;
    result += `${remarks}\n\n`;

    if (this.annotation.type === "hook") {
      result += `## Parameters\n\n`;
    } else if (this.annotation.type === "component") {
      result += `## Props\n\n`;
    } else if (this.annotation.type === "class") {
      result += `## Constructor\n\n`;
    }

    for (const property of arg0InterfaceDefinition.properties) {
      if (property.comment.includes("@deprecated")) {
        continue;
      }

      result += `<ResponseField name="${property.name}" type="${property.type}" ${property.required ? "required" : ""}>\n`;
      result += `${property.comment}\n`;
      result += `</ResponseField>\n\n`;
    }

    if (this.annotation.type === "class") {
      const methodDefinitions = await source.getPublicMethodDefinitions(this.annotation.name);

      for (const method of methodDefinitions) {
        result += `## ${method.signature}\n\n`;
        result += `${method.comment}\n\n`;
        for (const param of method.parameters) {
          result += `<ResponseField name="${param.name}" type="${param.type}" ${param.required ? "required" : ""}>\n`;
          result += `${param.comment}\n`;
          result += `</ResponseField>\n\n`;
        }
      }
    }

    return result;
  }
}
