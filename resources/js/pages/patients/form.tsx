import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import type { FormEvent } from 'react';

interface Patient {
    id: number;
    patient_name: string;
}

interface PatientFormData {
    [key: string]: string;
    patient_name: string;
}

function RequiredLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
    return (
        <Label htmlFor={htmlFor}>
            {children} <span className="text-destructive" aria-label="required">*</span>
        </Label>
    );
}

export default function PatientForm({ patient }: { patient: Patient | null }) {
    const editing = patient !== null;
    const { data, setData, post, put, processing, errors } = useForm<PatientFormData>({
        patient_name: patient?.patient_name ?? '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (editing) {
            put(route('patients.update', patient.id));
        } else {
            post(route('patients.store'));
        }
    }

    const title = editing ? 'Edit patient' : 'Add patient';

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Patient Management', href: route('patients.index') },
                {
                    title,
                    href: editing ? route('patients.edit', patient.id) : route('patients.create'),
                },
            ]}
        >
            <Head title={title} />
            <main className="mx-auto w-full max-w-2xl space-y-6 p-4 md:p-8">
                <div>
                    <Button variant="ghost" size="sm" className="-ml-3 mb-3" asChild>
                        <Link href={route('patients.index')}>
                            <ArrowLeft /> Back to patients
                        </Link>
                    </Button>
                    <p className="text-sm font-medium text-primary">Patient care</p>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {editing
                            ? "Update the patient's name."
                            : 'Register a new patient to include them in dispensing records.'}
                    </p>
                </div>

                <Card className="rounded-xl shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserPlus className="size-5 text-primary" />
                            Patient information
                        </CardTitle>
                        <CardDescription>
                            Fields marked with <span className="text-destructive">*</span> are required.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <RequiredLabel htmlFor="patient_name">Full name</RequiredLabel>
                                <Input
                                    id="patient_name"
                                    required
                                    maxLength={255}
                                    autoComplete="off"
                                    placeholder="e.g. Juan dela Cruz"
                                    value={data.patient_name}
                                    onChange={(e) => setData('patient_name', e.target.value)}
                                />
                                <InputError message={errors.patient_name} />
                            </div>

                            <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                                <Button type="button" variant="outline" asChild>
                                    <Link href={route('patients.index')}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save />
                                    {processing ? 'Saving…' : editing ? 'Save changes' : 'Add patient'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </AppLayout>
    );
}
