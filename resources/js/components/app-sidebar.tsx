import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { ClipboardList, LayoutDashboard, Pill, Stethoscope, Users } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: route('dashboard'),
        icon: LayoutDashboard,
    },
    {
        title: 'Patients',
        url: route('patients.index'),
        icon: Users,
    },
    {
        title: 'Doctors',
        url: route('doctors.index'),
        icon: Stethoscope,
    },
    {
        title: 'Medicines',
        url: route('medicines.index'),
        icon: Pill,
    },
    {
        title: 'Dispensing Records',
        url: route('dispense-records.index'),
        icon: ClipboardList,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" className="h-14" asChild>
                            <Link href={route('dashboard')} prefetch>
                                <span className="flex min-w-0 flex-1 items-center px-1">
                                    <AppLogo className="h-8 max-w-full" />
                                </span>
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
