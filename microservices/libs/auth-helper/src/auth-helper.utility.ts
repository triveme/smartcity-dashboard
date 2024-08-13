import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
import * as path from 'path';

const rootDir = path.resolve(__dirname, '../../../');
const envPath = path.join(rootDir, '.env');
config({ path: envPath }); // Load environment variables from .env file in root directory

@Injectable()
export class AuthHelperUtility {
  readonly adminRole = process.env.ADMIN_ROLE as string;
  readonly editorRoles = process.env.EDIT_ROLES
    ? JSON.parse(process.env.EDIT_ROLES)
    : ([] as string[]);

  isAdmin(rolesFromRequest: string[]): boolean {
    if (!this.adminRole) {
      throw new Error('ADMIN_ROLE env var does not exist');
    } else {
      return rolesFromRequest.includes(this.adminRole);
    }
  }

  isEditor(rolesFromRequest: string[]): boolean {
    if (this.editorRoles && this.editorRoles.length === 0) {
      throw new Error('EDIT_ROLES var does not exist');
    } else {
      return this.editorRoles.some((value) => rolesFromRequest.includes(value));
    }
  }
}
