const Generator = require("yeoman-generator");
const { execSync } = require("child_process");
const fs = require("fs");

module.exports = class extends Generator {
  async prompting() {
    this.log("Bem vindo ao gerador de projetos da LP2!");

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

    this.destinationRoot(this.destinationPath(projectName));
    this.log(
      `Criando a pasta e do projeto ${projectName} e o inicializando...`
    );

    execSync("yarn init -y", {
      cwd: this.destinationPath(""),
      stdio: "inherit"
    });

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

    const jestConfig = `
import type { Config } from "jest";

const config: Config = {
    verbose: true,
    preset: "ts-jest",
    testEnvironment: "node",
    watchPathIgnorePatterns: [".*\\.json$", ".*\\.csv$"],
};

export default config;
    `;
    fs.writeFileSync(this.destinationPath("jest.config.ts"), jestConfig);

    const gitIgnore = `
node_modules/
coverage/    
    `;
    fs.writeFileSync(this.destinationPath(".gitignore"), gitIgnore);


    this.fs.write(this.destinationPath("src/index.ts"), "// Bons códigos!");

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
    const projectDir = this.destinationRoot();
    this.log("Instalando dependências...");

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
