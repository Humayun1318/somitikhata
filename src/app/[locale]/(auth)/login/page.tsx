import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F8F7] px-4 py-10">
      <div className="w-full max-w-md rounded-[24px] border border-[#E3E6E4] bg-white p-7 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F6B4F] text-lg font-bold text-white">SK</div>
          <h1 className="mt-4 text-2xl font-bold text-[#111827]">স্বাগতম</h1>
          <p className="mt-2 text-sm text-[#5B6660]">আপনার সমিতির ড্যাশবোর্ডে লগইন করুন</p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#111827]">ফোন বা ইমেইল</label>
            <input placeholder="01XXXXXXXXX বা name@email.com" className="h-11 w-full rounded-xl border border-[#E3E6E4] bg-white px-3 text-sm outline-none focus:border-[#0F6B4F]" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#111827]">পাসওয়ার্ড</label>
            <input type="password" placeholder="পাসওয়ার্ড লিখুন" className="h-11 w-full rounded-xl border border-[#E3E6E4] bg-white px-3 text-sm outline-none focus:border-[#0F6B4F]" />
          </div>
          <div className="flex items-center justify-between text-sm text-[#5B6660]">
            <label className="flex items-center gap-2"><input type="checkbox" /> মনে রাখুন</label>
            <Link href="/bn/login" className="font-medium text-[#0F6B4F]">পাসওয়ার্ড ভুলে গেছেন?</Link>
          </div>
          <button type="submit" className="h-11 w-full rounded-xl bg-[#0F6B4F] font-semibold text-white hover:bg-[#0C5A42]">
            লগইন
          </button>
        </form>

        <div className="mt-6 border-t border-[#E3E6E4] pt-5 text-center text-sm text-[#5B6660]">
          অ্যাক্সেস দরকার? <Link href="/bn/register" className="font-semibold text-[#0F6B4F]">রেজিস্ট্রেশন অনুরোধ</Link>
        </div>
      </div>
    </main>
  );
}
