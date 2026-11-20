import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Pencil, Search, Stethoscope, Trash2, UserPlus } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import type { SharedData } from '@/types';

interface Doctor {
    id: number;
    doctor_name: string;
    doctor_license_no: string;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface DoctorPage {
    data: Doctor[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    links: PaginationLink[];
}

interface DoctorIndexProps {
    doctors: DoctorPage;
    search: string;
}

export default function DoctorIndex({ doctors, search }: DoctorIndexProps) {
    const [query, setQuery] = useState(search);
    const [deleteTarget, setDeleteTarget] = useState<Doctor | null>(null);
    const { flash } = usePage<SharedData>().props;
    const { delete: destroy, processing: deleting } = useForm();

    function submitSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get(route('doctors.index'), { search: query }, { preserveState: true, replace: true });
    }

    function confirmDelete(doctor: Doctor) {
        setDeleteTarget(doctor);
    }

    function handleDelete() {
        if (!deleteTarget) return;
        destroy(route('doctors.destroy', deleteTarget.id), {
            onSuccess: () => setDeleteTarget(null),
            onError: () => setDeleteTarget(null),
        });
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Doctor Management', href: route('doctors.index') }]}>
            <Head title="Doctor Management" />

            <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete doctor?</AlertDialogTitle>
                        <AlertDialogDescription>
                            <strong>{deleteTarget?.doctor_name}</strong> (License: {deleteTarget?.doctor_license_no}) will be removed from active lists.
                            Their dispensing history will be preserved.
                            This action can be undone by an administrator from the database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? 'Deleting…' : 'Delete doctor'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <main className="space-y-6 p-4 md:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-primary">Prescribers</p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Doctor Management</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Add, update, or remove prescribing doctors from the system.</p>
                    </div>
                    <Button asChild>
                        <Link href={route('doctors.create')}><UserPlus /> Add doctor</Link>
                    </Button>
                </div>

                <Card className="rounded-xl shadow-sm">
                    <CardContent className="p-4 md:p-6">
                        {flash.success && (
                            <div role="status" className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
                                {flash.success}
                            </div>
                        )}

                        <form onSubmit={submitSearch} className="mb-5 flex flex-col gap-3 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                                <Input
                                    aria-label="Search doctors"
                                    className="pl-9"
                                    placeholder="Search by name or license number"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                            </div>
                            <Button type="submit" variant="outline">Search</Button>
                            {search && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        setQuery('');
                                        router.get(route('doctors.index'), {}, { preserveState: true, replace: true });
                                    }}
                                >
                                    Clear
                                </Button>
                            )}
                        </form>

                        {doctors.data.length === 0 ? (
                            <div className="rounded-lg border border-dashed bg-muted/20 px-6 py-14 text-center">
                                <Stethoscope className="mx-auto size-9 text-muted-foreground" />
                                <h2 className="mt-4 font-semibold">
                                    {search ? 'No matching doctors' : 'No doctors yet'}
                                </h2>
                                <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                                    {search
                                        ? 'Try a different name or license number.'
                                        : 'Add your first prescribing doctor to include them in dispensing records.'}
                                </p>
                                {!search && (
                                    <Button className="mt-5" asChild>
                                        <Link href={route('doctors.create')}><UserPlus /> Add first doctor</Link>
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                <th className="px-3 py-3">#</th>
                                                <th className="px-3 py-3">Doctor name</th>
                                                <th className="px-3 py-3">License no.</th>
                                                <th className="px-3 py-3">Date added</th>
                                                <th className="px-3 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {doctors.data.map((doctor, index) => {
                                                const rowNumber = (doctors.from ?? 1) + index;
                                                return (
                                                    <tr key={doctor.id} className="hover:bg-muted/30">
                                                        <td className="px-3 py-3.5 text-muted-foreground tabular-nums">
                                                            {rowNumber}
                                                        </td>
                                                        <td className="px-3 py-3.5 font-medium">
                                                            {doctor.doctor_name}
                                                        </td>
                                                        <td className="px-3 py-3.5 font-mono text-xs text-muted-foreground">
                                                            {doctor.doctor_license_no}
                                                        </td>
                                                        <td className="px-3 py-3.5 text-sm text-muted-foreground">
                                                            {new Date(doctor.created_at).toLocaleDateString(undefined, {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                            })}
                                                        </td>
                                                        <td className="px-3 py-3.5">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button variant="outline" size="sm" asChild>
                                                                    <Link href={route('doctors.edit', doctor.id)}>
                                                                        <Pencil className="size-3.5" />
                                                                        Edit
                                                                    </Link>
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive"
                                                                    onClick={() => confirmDelete(doctor)}
                                                                >
                                                                    <Trash2 className="size-3.5" />
                                                                    Delete
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-5 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        Showing {doctors.data.length} of {doctors.total} doctor{doctors.total !== 1 ? 's' : ''}
                                    </p>
                                    {doctors.last_page > 1 && (
                                        <nav className="flex flex-wrap gap-1" aria-label="Doctor pages">
                                            {doctors.links.map((link, i) =>
                                                link.url ? (
                                                    <Link
                                                        key={i}
                                                        href={link.url}
                                                        preserveScroll
                                                        className={`rounded-md border px-3 py-1.5 text-sm ${
                                                            link.active
                                                                ? 'border-primary bg-primary text-primary-foreground'
                                                                : 'bg-background text-foreground hover:bg-muted'
                                                        }`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ) : (
                                                    <span
                                                        key={i}
                                                        className="rounded-md border px-3 py-1.5 text-sm text-muted-foreground opacity-50"
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ),
                                            )}
                                        </nav>
                                    )}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </main>
        </AppLayout>
    );
}
