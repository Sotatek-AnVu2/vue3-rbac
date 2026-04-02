export enum Role {
  Admin = 'admin',
  Editor = 'editor',
  Viewer = 'viewer',
}

export interface UserAccount {
  id: string
  name: string
  role: Role
}

export interface PermissionItem {
  id: string
  title: string
  icon?: string
  path: string
  roles: string[]
  children?: PermissionItem[]
}

