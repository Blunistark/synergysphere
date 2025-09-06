import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useBreadcrumbs, BreadcrumbItem as BreadcrumbItemType } from '@/hooks/useBreadcrumbs';

interface BreadcrumbsProps {
  customBreadcrumbs?: BreadcrumbItemType[];
  className?: string;
}

export function Breadcrumbs({ customBreadcrumbs, className }: BreadcrumbsProps) {
  const breadcrumbs = useBreadcrumbs(customBreadcrumbs);

  // Don't render if no breadcrumbs
  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <BreadcrumbItem key={index}>
            {index === 0 && (
              <Home className="h-4 w-4 mr-1" />
            )}
            {crumb.href ? (
              <BreadcrumbLink asChild>
                <Link to={crumb.href} className="flex items-center">
                  {crumb.label}
                </Link>
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage className="flex items-center">
                {crumb.label}
              </BreadcrumbPage>
            )}
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
