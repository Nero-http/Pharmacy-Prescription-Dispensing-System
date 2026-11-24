import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    // Strip query string and trailing slash for matching.
    const currentPath = page.url.split('?')[0].replace(/\/$/, '');

    function isActive(itemUrl: string): boolean {
        // Extract just the path from the full URL.
        const itemPath = itemUrl
            .replace(/^https?:\/\/[^/]+/, '')
            .split('?')[0]
            .replace(/\/$/, '');

        // Dashboard: exact match only.
        if (itemPath === '/dashboard') {
            return currentPath === itemPath;
        }

        // All other sections: active when on that path or any sub-path
        // (e.g. /patients/create, /patients/1/edit).
        return currentPath === itemPath || currentPath.startsWith(itemPath + '/');
    }

    return (
        <SidebarGroup className="px-2 py-3">
            <SidebarGroupLabel className="px-3 text-[10px] font-semibold tracking-[0.14em] uppercase">Workspace</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={isActive(item.url)}>
                            <Link href={item.url} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
