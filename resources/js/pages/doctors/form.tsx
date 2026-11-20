import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Stethoscope } from 'lucide-react';
import type { FormEvent } from 'react';

interface Doctor {
    id: number;
    doctor_name: string;
    doctor_license_no: string;
}

interface DoctorFormData {
    [key: string]: string;
    doctor_name: string;
    doctor_license_no: string;
}

function RequiredLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
    return (
        <Label htmlFor={htmlFor}>
            {children} <span className="text-destructive" aria-label="required">*</span>
        </Label>
    );
}

export default function DoctorForm({ doctor }: { doctor: Doctor | null }) {
    const editing = doctor !== null;
    const { data, setData, post, put, processing, errors } = useForm<DoctorFormData>({
        doctor_name: doctor?.doctor_name ?? '',
        doctor_license_no: doctor?.doctor_license_no ?? '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (editing) {
            put(route('doctors.update', doctor.id));
        } else {
            post(route('doctors.store'));
        }
    }

    const title = editing ? 'Edit doctor' : 'Add doctor';

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Doctor Management', href: route('doctors.index') },
                {
                    title,
                    href: editing ? route('doctors.edit', doctor.id) : route('doctors.create'),
                },
            ]}
        >
            <Head title={title} />
            <main className="mx-auto w-full max-w-2xl space-y-6 p-4 md:p-8">
                <div>
                    <Button variant="ghost" size="sm" className="-ml-3 mb-3" asChild>
                        <Link href={route('doctors.index')}>
                            <ArrowLeft /> Back to doctors
                        </Link>
                    </Button>
                    <p className="text-sm font-medium text-primary">Prescribers</p>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {editing
                            ? "Update the doctor's name or license number."
                            : 'Register a new prescribing doctor to include them in dispensing records.'}
                    </p>
                </div>

                <Card className="rounded-xl shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Stethoscope className="size-5 text-primary" />
                            Doctor information
                        </CardTitle>
                        <CardDescription>
                            Fields marked with <span className="text-destructive">*</span> are required.
                            The license number is stored in uppercase.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="space-y-2 sm:col-span-2">
                                    <RequiredLabel htmlFor="doctor_name">Full name</RequiredLabel>
                                    <Input
                                        id="doctor_name"
                                        required
                                        maxLength={255}
                                        autoComplete="off"
                                        placeholder="e.g. Dr. Maria Santos"
                                        value={data.doctor_name}
                                        onChange={(e) => setData('doctor_name', e.target.value)}
                                    />
                                    <InputError message={errors.doctor_name} />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <RequiredLabel htmlFor="doctor_license_no">License number</RequiredLabel>
                                    <Input
                                        id="doctor_license_no"
                                        required
                                        maxLength={255}
                                        autoComplete="off"
                                        placeholder="e.g. PRC-12345"
                                        value={data.doctor_license_no}
                                        onChange={(e) =>
                                            setData('doctor_license_no', e.target.value.toUpperCase())
                                        }
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Must be unique. Automatically converted to uppercase.
                                    </p>
                                    <InputError message={errors.doctor_license_no} />
                                </div>
                            </div>

                            <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                                <Button type="button" variant="outline" asChild>
                                    <Link href={route('doctors.index')}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save />
                                    {processing ? 'Saving…' : editing ? 'Save changes' : 'Add doctor'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </AppLayout>
    );
}
