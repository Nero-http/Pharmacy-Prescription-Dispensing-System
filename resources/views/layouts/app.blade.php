
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>@yield('title', 'Pharmacy Dispensing System')</title>

    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            background: #f4f7f6;
            color: #263238;
        }

        header {
            background: #176b57;
            color: white;
            padding: 18px 7%;
        }

        header h2 {
            margin: 0 0 12px;
        }

        nav {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
        }

        nav a {
            color: white;
            text-decoration: none;
        }

        nav a:hover {
            text-decoration: underline;
        }

        .user-info {
            margin-left: auto;
            font-size: 14px;
        }

        main {
            max-width: 1100px;
            margin: 30px auto;
            padding: 0 20px;
        }

        .card {
            background: white;
            padding: 22px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px #0000000d;
        }

        input, select, button {
            padding: 10px;
            margin: 5px 0;
            max-width: 100%;
            box-sizing: border-box;
        }

        input, select {
            border: 1px solid #ccc;
            border-radius: 4px;
        }

        button, .btn {
            background: #176b57;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 10px 14px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
        }

        button:hover, .btn:hover {
            opacity: 0.9;
        }

        .btn-secondary {
            background: #536570;
        }

        .logout-form {
            display: inline;
            margin: 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
        }

        th, td {
            padding: 12px;
            border-bottom: 1px solid #ddd;
            text-align: left;
        }

        th {
            background: #e8f2ef;
        }

        .table-wrap {
            overflow-x: auto;
        }

        .success {
            background: #d9f5e5;
            padding: 12px;
            margin-bottom: 15px;
            border-radius: 5px;
        }

        .error {
            color: #b42318;
            font-size: 14px;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            margin-bottom: 12px;
        }

        .form-group input,
        .form-group select {
            width: 100%;
        }

        footer {
            text-align: center;
            padding: 20px;
            color: #667;
        }

        @media (max-width: 600px) {
            header {
                padding: 18px 5%;
            }

            nav {
                gap: 12px;
            }

            .user-info {
                margin-left: 0;
                width: 100%;
            }

            main {
                padding: 0 12px;
            }
        }
    </style>
</head>

<body>

    <header>
        <h2>Pharmacy Prescription Dispensing System</h2>

        <nav>
            <a href="{{ route('medicines.index') }}">Medicines</a>

            <a href="{{ route('medicines.create') }}">Add Medicine</a>

            <a href="{{ route('dispense-records.index') }}">
                Dispensing Records
            </a>

            <a href="{{ route('dispense-records.create') }}">
                Dispense Medicine
            </a>

            @auth
                <span class="user-info">
                    Welcome, {{ Auth::user()->name }}
                </span>

                <form
                    method="POST"
                    action="{{ route('logout') }}"
                    class="logout-form"
                >
                    @csrf

                    <button type="submit" class="btn-secondary">
                        Logout
                    </button>
                </form>
            @endauth
        </nav>
    </header>

    <main>

        @if (session('success'))
            <div class="success">
                {{ session('success') }}
            </div>
        @endif

        @if ($errors->any())
            <div class="card">
                <strong>Please correct the following errors:</strong>

                <ul>
                    @foreach ($errors->all() as $error)
                        <li class="error">
                            {{ $error }}
                        </li>
                    @endforeach
                </ul>
            </div>
        @endif

        @yield('content')

    </main>

    <footer>
        Pharmacy Prescription Dispensing System
    </footer>

</body>
</html>
