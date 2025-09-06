import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

interface RouteConfig {
  path: string;
  label: string;
  dynamic?: boolean;
}

const routeConfigs: RouteConfig[] = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/projects', label: 'Projects' },
  { path: '/projects/:id', label: 'Project Details', dynamic: true },
  { path: '/projects/:id/tasks', label: 'Tasks', dynamic: true },
  { path: '/projects/:id/team', label: 'Team', dynamic: true },
  { path: '/projects/:id/activity', label: 'Activity', dynamic: true },
  { path: '/tasks', label: 'Tasks' },
  { path: '/profile', label: 'Profile' },
  { path: '/settings', label: 'Settings' },
];

export function useBreadcrumbs(customBreadcrumbs?: BreadcrumbItem[]): BreadcrumbItem[] {
  const location = useLocation();

  return useMemo(() => {
    // If custom breadcrumbs are provided, use them
    if (customBreadcrumbs) {
      return [
        { label: 'Dashboard', href: '/dashboard' },
        ...customBreadcrumbs
      ];
    }

    // Auto-generate breadcrumbs from current path
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    // Don't show breadcrumbs for root paths
    if (pathSegments.length === 0 || pathSegments[0] === 'login' || pathSegments[0] === 'register') {
      return [];
    }

    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Dashboard', href: '/dashboard' }
    ];

    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      // Find matching route config
      const routeConfig = routeConfigs.find(config => {
        if (config.dynamic) {
          const pattern = config.path.replace(/:[^/]+/g, '[^/]+');
          return new RegExp(`^${pattern}$`).test(currentPath);
        }
        return config.path === currentPath;
      });

      if (routeConfig) {
        breadcrumbs.push({
          label: routeConfig.label,
          href: isLast ? undefined : currentPath,
          isCurrentPage: isLast
        });
      } else {
        // Fallback to segment name
        const label = segment.charAt(0).toUpperCase() + segment.slice(1);
        breadcrumbs.push({
          label,
          href: isLast ? undefined : currentPath,
          isCurrentPage: isLast
        });
      }
    });

    return breadcrumbs;
  }, [location.pathname, customBreadcrumbs]);
}
