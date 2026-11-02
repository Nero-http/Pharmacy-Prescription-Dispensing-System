import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { ClipboardList, LayoutDashboard, PackagePlus, Pill, PlusCircle } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: route('dashboard'),
        icon: LayoutDashboard,
    },
    {
        title: 'Medicine Management',
        url: route('medicines.index'),
        icon: Pill,
    },
    {
        title: 'Dispensing Records',
        url: route('dispense-records.index'),
        icon: ClipboardList,
    },
    {
        title: 'Add Medicine',
        url: route('medicines.create'),
        icon: PackagePlus,
    },
    {
        title: 'Dispense Medicine',
        url: route('dispense-records.create'),
        icon: PlusCircle,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
