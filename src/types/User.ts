export interface User {
  id: string
  title: string
  icon?: string
  path: string
  roles: string[]
  children?: User[]
}

export enum Role {
  Admin = 'admin',
  Editor = 'editor',
  Viewer = 'viewer',
}

