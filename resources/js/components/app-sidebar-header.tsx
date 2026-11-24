import AppLogo from '@/components/app-logo';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Link } from '@inertiajs/react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    return (
        <header className="border-border bg-background flex h-14 shrink-0 items-center gap-3 border-b px-4 sm:px-6">
            <SidebarTrigger className="-ml-1 shrink-0" />
            <div className="min-w-0 flex-1">
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <Link href={route('dashboard')} aria-label="PPDS dashboard">
                <AppLogo className="h-7 w-auto max-w-[112px] sm:max-w-[132px]" />
            </Link>
        </header>
    );
}
