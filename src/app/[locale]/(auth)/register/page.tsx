import Link from 'next/link';

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F8F7] px-4 py-10">
      <div className="w-full max-w-lg rounded-[24px] border border-[#E3E6E4] bg-white p-7 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1E3A5F] text-lg font-bold text-white">SK</div>
          <h1 className="mt-4 text-2xl font-bold text-[#111827]">অ্যাক্সেস তৈরি করুন</h1>
          <p className="mt-2 text-sm text-[#5B6660]">শুধুমাত্র অনুমোদিত সদস্যই রেজিস্ট্রেশন করতে পারবেন। admin-এর pre-approval প্রয়োজন।</p>
        </div>

        <form className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#111827]">পূর্ণ নাম</label>
              <input className="h-11 w-full rounded-xl border border-[#E3E6E4] bg-white px-3 text-sm outline-none focus:border-[#0F6B4F]" placeholder="আপনার নাম" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#111827]">ফোন</label>
              <input className="h-11 w-full rounded-xl border border-[#E3E6E4] bg-white px-3 text-sm outline-none focus:border-[#0F6B4F]" placeholder="01XXXXXXXXX" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#111827]">ইমেইল</label>
            <input type="email" className="h-11 w-full rounded-xl border border-[#E3E6E4] bg-white px-3 text-sm outline-none focus:border-[#0F6B4F]" placeholder="name@email.com" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#111827]">পাসওয়ার্ড</label>
            <input type="password" className="h-11 w-full rounded-xl border border-[#E3E6E4] bg-white px-3 text-sm outline-none focus:border-[#0F6B4F]" placeholder="পাসওয়ার্ড নির্বাচন করুন" />
          </div>
          <button type="submit" className="h-11 w-full rounded-xl bg-[#0F6B4F] font-semibold text-white hover:bg-[#0C5A42]">
            রেজিস্ট্রেশন অনুরোধ
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#5B6660]">
          ইতিমধ্যে অ্যাক্সেস আছে? <Link href="/bn/login" className="font-semibold text-[#0F6B4F]">লগইন করুন</Link>
        </div>
      </div>
    </main>
  );
}
