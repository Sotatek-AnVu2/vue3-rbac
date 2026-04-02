import { Role, type PermissionItem, type UserAccount } from '@/types/User'

export const mockAccounts: UserAccount[] = [
  { id: '1', name: 'Admin', role: Role.Admin },
  { id: '2', name: 'Editor', role: Role.Editor },
  { id: '3', name: 'Viewer', role: Role.Viewer },
]

export const mockNavigationData: PermissionItem[] = [
  {
    id: '1',
    title: 'Dashboard',
    icon: 'HomeIcon',
    path: '/dashboard',
    roles: ['admin', 'editor', 'viewer'],
  },
  {
    id: '2',
    title: 'Content Management',
    icon: 'DocumentIcon',
    path: '/content',
    roles: ['admin', 'editor'],
    children: [
      {
        id: '21',
        title: 'Articles',
        path: '/content/articles',
        roles: ['admin', 'editor'],
        children: [
          {
            id: '211',
            title: 'Drafts',
            path: '/content/articles/drafts',
            roles: ['admin', 'editor'],
          },
          {
            id: '212',
            title: 'Published',
            path: '/content/articles/published',
            roles: ['admin'],
          },
        ],
      },
      {
        id: '22',
        title: 'Media Library',
        path: '/content/media',
        roles: ['admin', 'editor'],
      },
    ],
  },
  {
    id: '3',
    title: 'System Settings',
    icon: 'CogIcon',
    path: '/settings',
    roles: ['admin'],
    children: [
      {
        id: '31',
        title: 'User Permissions',
        path: '/settings/permissions',
        roles: ['admin'],
      },
      {
        id: '32',
        title: 'Audit Logs',
        path: '/settings/logs',
        roles: ['admin'],
      },
    ],
  },
]
