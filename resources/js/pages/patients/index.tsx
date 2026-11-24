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
import { Pencil, Search, Trash2, UserPlus, Users } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import type { SharedData } from '@/types';

interface Patient {
    id: number;
    patient_name: string;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PatientPage {
    data: Patient[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    links: PaginationLink[];
}

interface PatientIndexProps {
    patients: PatientPage;
    search: string;
}

export default function PatientIndex({ patients, search }: PatientIndexProps) {
    const [query, setQuery] = useState(search);
    const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);
    const { flash } = usePage<SharedData>().props;
    const { delete: destroy, processing: deleting } = useForm();

    function submitSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get(route('patients.index'), { search: query }, { preserveState: true, replace: true });
    }

    function confirmDelete(patient: Patient) {
        setDeleteTarget(patient);
    }

    function handleDelete() {
        if (!deleteTarget) return;
        destroy(route('patients.destroy', deleteTarget.id), {
            onSuccess: () => setDeleteTarget(null),
            onError: () => setDeleteTarget(null),
        });
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Patient Management', href: route('patients.index') }]}>
            <Head title="Patient Management" />

            <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete patient?</AlertDialogTitle>
                        <AlertDialogDescription>
                            <strong>{deleteTarget?.patient_name}</strong> will be removed from active lists. Their dispensing history will be preserved.
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
                            {deleting ? 'Deleting…' : 'Delete patient'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <main className="ppds-page">
                <div className="ppds-page-heading">
                    <div>
                        <p className="text-sm font-medium text-primary">Patient care</p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Patient Management</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Add, update, or remove patients from the system.</p>
                    </div>
                    <Button asChild>
                        <Link href={route('patients.create')}><UserPlus /> Add patient</Link>
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
                                    aria-label="Search patients"
                                    className="pl-9"
                                    placeholder="Search by patient name"
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
                                        router.get(route('patients.index'), {}, { preserveState: true, replace: true });
                                    }}
                                >
                                    Clear
                                </Button>
                            )}
                        </form>

                        {patients.data.length === 0 ? (
                            <div className="rounded-lg border border-dashed bg-muted/20 px-6 py-14 text-center">
                                <Users className="mx-auto size-9 text-muted-foreground" />
                                <h2 className="mt-4 font-semibold">
                                    {search ? 'No matching patients' : 'No patients yet'}
                                </h2>
                                <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                                    {search
                                        ? 'Try a different name.'
                                        : 'Add your first patient to start dispensing prescriptions.'}
                                </p>
                                {!search && (
                                    <Button className="mt-5" asChild>
                                        <Link href={route('patients.create')}><UserPlus /> Add first patient</Link>
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[560px] text-left text-sm">
                                        <thead>
                                            <tr className="border-b text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                <th className="px-3 py-3">#</th>
                                                <th className="px-3 py-3">Patient name</th>
                                                <th className="px-3 py-3">Date added</th>
                                                <th className="px-3 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {patients.data.map((patient, index) => {
                                                const rowNumber = (patients.from ?? 1) + index;
                                                return (
                                                    <tr key={patient.id} className="hover:bg-muted/30">
                                                        <td className="px-3 py-3.5 text-muted-foreground tabular-nums">
                                                            {rowNumber}
                                                        </td>
                                                        <td className="px-3 py-3.5 font-medium">
                                                            {patient.patient_name}
                                                        </td>
                                                        <td className="px-3 py-3.5 text-sm text-muted-foreground">
                                                            {new Date(patient.created_at).toLocaleDateString(undefined, {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                            })}
                                                        </td>
                                                        <td className="px-3 py-3.5">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button variant="outline" size="sm" asChild>
                                                                    <Link href={route('patients.edit', patient.id)}>
                                                                        <Pencil className="size-3.5" />
                                                                        Edit
                                                                    </Link>
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive"
                                                                    onClick={() => confirmDelete(patient)}
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
                                        Showing {patients.data.length} of {patients.total} patient{patients.total !== 1 ? 's' : ''}
                                    </p>
                                    {patients.last_page > 1 && (
                                        <nav className="flex flex-wrap gap-1" aria-label="Patient pages">
                                            {patients.links.map((link, i) =>
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
