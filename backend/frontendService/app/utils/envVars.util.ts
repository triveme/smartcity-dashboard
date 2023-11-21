import * as dotenv from 'dotenv';

export class EnvVarsChecker {

  public static checkEnvVars(): void {
    this.checkIfVarsAreSet([
      'DB_HOST', 'DB_PORT', 'DB_NAME',
      'DB_USER', 'DB_PWD',
      'FRONTEND_HOST', 'SECRET', 'API_URL'
    ]);
  }

  public static checkIfVarsAreSet(variables: string[]): void {
    dotenv.config(); // load env variables

    for(const variable of variables) {
      if(process.env[variable] === undefined || process.env[variable] === '') {
        console.log(`\x1b[31m${variable} not set\x1b[0m`); // print unset env-variable in text-color red
      }
    }
  }
}
