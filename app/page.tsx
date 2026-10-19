
export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-slate-800">

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
            🛡
          </div>

          <span className="text-2xl font-bold">
            NEXUS
          </span>
        </div>

        <div className="flex items-center gap-8 text-sm text-slate-300">
          <a href="#about" className="hover:text-white">
            About
          </a>

          <a href="#features" className="hover:text-white">
            Features
          </a>

          <a href="#security" className="hover:text-white">
            Security
          </a>

          <a
            href="/login"
            className="rounded-lg border border-slate-700 px-5 py-2 hover:bg-slate-800"
          >
            Login
          </a>
        </div>

      </nav>


      {/* Hero Section */}
      <section className="relative px-8 py-28 text-center">

        <div className="mx-auto max-w-4xl">

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-400">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            Security Operations Center
          </div>


          <h1 className="text-5xl font-bold leading-tight md:text-7xl">
            Monitor.
            <span className="text-blue-500"> Detect.</span>
            <br />
            Respond.
          </h1>


          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Nexus is a security monitoring platform designed to
            help organizations detect suspicious activity, monitor
            user behavior, investigate security alerts, and respond
            to potential incidents.
          </p>


          <div className="mt-10 flex justify-center gap-4">

            <a
              href="/login"
              className="rounded-lg bg-blue-600 px-7 py-3 font-medium hover:bg-blue-700"
            >
              Access Nexus
            </a>


            <a
              href="#about"
              className="rounded-lg border border-slate-700 px-7 py-3 font-medium text-slate-300 hover:bg-slate-900"
            >
              Learn More
            </a>

          </div>

        </div>

      </section>


      {/* About */}
      <section
        id="about"
        className="border-t border-slate-800 px-8 py-24"
      >

        <div className="mx-auto max-w-6xl">

          <div className="max-w-2xl">

            <p className="text-sm font-semibold uppercase tracking-widest text-blue-500">
              About Nexus
            </p>

            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              Security visibility in one place.
            </h2>

            <p className="mt-5 leading-8 text-slate-400">
              Nexus brings security events, user activity, alerts,
              and incidents together in one centralized security
              operations environment.
            </p>

          </div>


          <div
            id="features"
            className="mt-14 grid gap-6 md:grid-cols-3"
          >

            {/* Monitoring */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-7">

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-2xl">
                ◉
              </div>

              <h3 className="text-xl font-semibold">
                Security Monitoring
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Monitor user activity and system events to maintain
                visibility across the application.
              </p>

            </div>


            {/* Detection */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-7">

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-2xl">
                ◇
              </div>

              <h3 className="text-xl font-semibold">
                Threat Detection
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Identify suspicious behavior and unusual activity
                before it becomes a larger security problem.
              </p>

            </div>


            {/* Response */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-7">

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-2xl">
                !
              </div>

              <h3 className="text-xl font-semibold">
                Incident Response
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Investigate alerts, manage security incidents, and
                track responses from detection to resolution.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* Security Section */}
      <section
        id="security"
        className="border-t border-slate-800 bg-slate-900/40 px-8 py-24"
      >

        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:items-center">

          <div>

            <p className="text-sm font-semibold uppercase tracking-widest text-blue-500">
              Security Operations
            </p>

            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              Stay ahead of security threats.
            </h2>

            <p className="mt-5 leading-8 text-slate-400">
              Nexus continuously brings together security information
              so security teams can understand what is happening,
              identify threats, and take action quickly.
            </p>

          </div>


          <div className="space-y-4">

            <div className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-950 p-5">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
                ✓
              </div>

              <div>
                <h3 className="font-semibold">
                  Real-time Monitoring
                </h3>

                <p className="text-sm text-slate-400">
                  Keep track of important security events.
                </p>
              </div>

            </div>


            <div className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-950 p-5">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-400">
                !
              </div>

              <div>
                <h3 className="font-semibold">
                  Security Alerts
                </h3>

                <p className="text-sm text-slate-400">
                  Identify activity that requires attention.
                </p>
              </div>

            </div>


            <div className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-950 p-5">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                !
              </div>

              <div>
                <h3 className="font-semibold">
                  Incident Management
                </h3>

                <p className="text-sm text-slate-400">
                  Investigate and manage security incidents.
                </p>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* CTA */}
      <section className="px-8 py-24 text-center">

        <h2 className="text-3xl font-bold md:text-4xl">
          Secure your operations with Nexus.
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-slate-400">
          Centralize security monitoring, detect suspicious
          activity, and respond to incidents from one platform.
        </p>

        <a
          href="/login"
          className="mt-8 inline-block rounded-lg bg-blue-600 px-8 py-3 font-medium hover:bg-blue-700"
        >
          Get Started
        </a>

      </section>


      {/* Footer */}
      <footer className="border-t border-slate-800 px-8 py-8 text-center text-sm text-slate-500">

        © 2026 Nexus Security Operations Center.
        All rights reserved.

      </footer>

    </main>
  );
}
