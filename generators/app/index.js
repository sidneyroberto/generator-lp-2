const Generator = require("yeoman-generator");
const { execSync } = require("child_process");
const fs = require("fs");

module.exports = class extends Generator {
  async prompting() {
    this.log("Bem vindo ao gerador de projetos da LP2!");

    // Prompt for project name
    this.answers = await this.prompt([
      {
        type: "input",
        name: "projectName",
        message: "Digite o nome do projeto:",
        default: "my-typescript-project"
      }
    ]);
  }

  writing() {
    const { projectName } = this.answers;

    // Create the project folder
    this.destinationRoot(this.destinationPath(projectName));
    this.log(`Criando a pasta do projeto: ${projectName}`);

    // Create tsconfig.json with the specified content
    const tsConfig = {
      compilerOptions: {
        module: "CommonJS",
        target: "ES2020",
        esModuleInterop: true
      }
    };
    fs.writeFileSync(
      this.destinationPath("tsconfig.json"),
      JSON.stringify(tsConfig, null, 2)
    );

    // Create jest.config.ts with the specified content
    const jestConfig = `
import type { Config } from "jest";

const config: Config = {
    verbose: true,
    preset: "ts-jest",
    testEnvironment: "node",
};

export default config;
    `;
    fs.writeFileSync(this.destinationPath("jest.config.ts"), jestConfig);

    // Create src/index.ts as an entry point
    this.fs.write(
      this.destinationPath("src/index.ts"),
      "// Your entry point code here."
    );

    // Modify package.json scripts if it exists
    const packageJsonPath = this.destinationPath("package.json");
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
      packageJson.scripts = {
        start: "ts-node src/index.ts",
        test: "jest --watchAll --coverage"
      };
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    } else {
      this.log("package.json não encontrado. Pulando a modificação do script.");
    }
  }

  install() {
    // Initialize Yarn and install dependencies inside the project folder
    const projectDir = this.destinationRoot();
    this.log("Inicializando o projeto com Yarn e instalando dependências...");

    execSync("yarn init -y", { cwd: projectDir, stdio: "inherit" });

    const devDependencies = [
      "typescript",
      "@types/node",
      "ts-node",
      "jest",
      "ts-jest",
      "@types/jest"
    ];

    execSync(`yarn add ${devDependencies.join(" ")} --dev`, {
      cwd: projectDir,
      stdio: "inherit"
    });
  }

  end() {
    this.log("Geração do projeto completa!");
  }
};
