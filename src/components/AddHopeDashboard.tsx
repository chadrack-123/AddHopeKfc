"use client";
import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Check, Shield, Trophy, QrCode, RefreshCcw, Share2, Download } from "lucide-react";

/**
 * Add Hope Transparency Dashboard – Hackathon Prototype
 * Single-file React component; uses Tailwind + shadcn/ui.
 * What it demonstrates (MVP):
 * 1) Monthly impact report (spending-to-impact tracker)
 * 2) Donor journey tiers (Bronze/Silver/Gold/Platinum)
 * 3) NGO storytelling card (image + quote placeholder)
 * 4) Tamper-evident delivery verification (QR/OTP mock + hash chain log)
 * 5) Simple rewards/voucher mock when reaching a tier
 */

// --- Mock Data ---
const MOCK_SPEND_ZAR = 512; // user KFC spend this month
const MOCK_DONATIONS = [
  { id: "d1", date: "2025-09-01", amount: 2 },
  { id: "d2", date: "2025-09-03", amount: 2 },
  { id: "d3", date: "2025-09-06", amount: 2 },
  { id: "d4", date: "2025-09-08", amount: 10 },
  { id: "d5", date: "2025-09-15", amount: 4 },
];
const MEAL_COST = 5; // ZAR per meal (mock)
const NGO_SAMPLE = {
  name: "Afrika Tikkun",
  area: "Soweto",
  stat: "200 children fed this month",
  story:
    "Our breakfast club ensures learners start the day nourished and ready to learn. Thank you for your support!",
  image:
    "/ngopic.jpg", // stock placeholder
};

// Simple hash utility to simulate tamper-evident chain
function hashString(s: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

function chainHash(prevHash: string, payload: any): string {
  return hashString(`${prevHash}|${JSON.stringify(payload)}`);
}

function tierFor(totalDonations: number) {
  if (totalDonations >= 200) return { name: "Platinum", perk: "Impact Day invite", pct: 100 };
  if (totalDonations >= 100) return { name: "Gold", perk: "10% off favourite meal", pct: Math.round((totalDonations / 200) * 100) };
  if (totalDonations >= 50) return { name: "Silver", perk: "5% discount voucher", pct: Math.round((totalDonations / 200) * 100) };
  if (totalDonations >= 10) return { name: "Bronze", perk: "Thank-you badge", pct: Math.round((totalDonations / 200) * 100) };
  return { name: "New", perk: "Make your first impact", pct: Math.round((totalDonations / 200) * 100) };
}

// KFC brand stripe bar (red/white)
const KFCBrandBar = () => (
  <div
    className="h-3 w-full"
    style={{
      backgroundImage:
        'repeating-linear-gradient(90deg, #e4002b 0 24px, #ffffff 24px 48px)'
    }}
  />
);

export default function AddHopeDashboard() {
  const [donations, setDonations] = useState(MOCK_DONATIONS);
  const totalDonations = useMemo(() => donations.reduce((s, d) => s + d.amount, 0), [donations]);
  const mealsProvided = Math.floor(totalDonations / MEAL_COST * 10); // exaggerated mapping for demo
  const tier = useMemo(() => tierFor(totalDonations), [totalDonations]);

  // Verification state
  const [siteCode, setSiteCode] = useState("");
  const [mealCount, setMealCount] = useState("");
  const [otp, setOtp] = useState("");
  type ChainEntry =
    | {
        idx: number;
        prev: string;
        payload: { genesis: boolean; note: string };
        hash: string;
        ts: string;
      }
    | {
        idx: number;
        prev: string;
        payload: {
          ts: string;
          site: string;
          meals: number;
          verifier: string;
          otp: string;
          gps_precision: string;
        };
        hash: string;
        ts: string;
      };

  const [chain, setChain] = useState<ChainEntry[]>([
    {
      idx: 0,
      prev: "00000000",
      payload: { genesis: true, note: "chain start" },
      hash: chainHash("00000000", { genesis: true, note: "chain start" }),
      ts: new Date().toISOString(),
    },
  ]);

  const addDonation = (amount = 2) => {
    const id = `d${donations.length + 1}`;
    setDonations([...donations, { id, date: new Date().toISOString().slice(0, 10), amount }]);
  };

  const verifyDelivery = () => {
    if (!siteCode || !mealCount || !otp) return;
    const payload = {
      ts: new Date().toISOString(),
      site: siteCode.toUpperCase(),
      meals: Number(mealCount),
      verifier: "Teacher/Youth Ambassador",
      otp,
      gps_precision: "~1km", // privacy-friendly
    };
    const prevHash = chain[chain.length - 1].hash;
    const entry = {
      idx: chain.length,
      prev: prevHash,
      payload,
      hash: chainHash(prevHash, payload),
      ts: payload.ts,
    };
    setChain([...chain, entry]);
    setSiteCode("");
    setMealCount("");
    setOtp("");
  };

  const shareReport = () => {
    const txt = `I donated R${totalDonations} to Add Hope – estimated ${mealsProvided} meals supported. Join me!`;
    if (navigator.share) {
      navigator.share({ title: "Add Hope Impact", text: txt });
    } else {
      navigator.clipboard.writeText(txt);
      alert("Copied a shareable message to your clipboard.");
    }
  };

  return (
    <div className=" min-h-screen w-full bg-white p-6 text-[17px] md:text-[18px]">
      <div className="mx-auto max-w-5xl space-y-6">
        <KFCBrandBar />
        <header className="flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-extrabold text-red-700">Add Hope Transparency Dashboard</h1>
          <div className="flex items-center gap-2">
            <Badge className="rounded-2xl px-3 py-1 text-sm bg-red-50 text-red-700 border border-red-200">This month</Badge>
            <Button variant="outline" className="border-red-600 text-red-700 hover:bg-red-50" onClick={() => addDonation(2)}>
              Quick add R2
            </Button>
          </div>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-5">
              <div className="text-sm text-slate-500">Your donations</div>
              <div className="mt-2 text-3xl font-semibold">R{totalDonations.toFixed(0)}</div>
              <div className="mt-1 text-xs text-slate-500">Across {donations.length} moments of giving</div>
              <div className="mt-4">
                <div className="mb-1 flex items-center gap-2 text-sm"><Trophy className="h-4 w-4"/>Tier: <span className="font-medium">{tier.name}</span></div>
                <Progress className="bg-red-100 [&>div]:bg-red-600" value={Math.min(100, tier.pct)} />
                <div className="mt-1 text-xs text-slate-500">Perk: {tier.perk}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-5">
              <div className="text-sm text-slate-500">Spending → Impact</div>
              <div className="mt-2 text-3xl font-semibold">{mealsProvided}</div>
              <div className="text-xs text-slate-500">estimated meals from R{MOCK_SPEND_ZAR} spend</div>
              <div className="mt-4 flex items-center gap-2">
                <Button size="sm" variant="outline" className="border-red-600 text-red-700 hover:bg-red-50" onClick={shareReport}>
                  <Share2 className="mr-2 h-4 w-4"/>Share impact
                </Button>
                {tier.name === "Silver" && (
                  <Button size="sm" variant="default" className="bg-red-600 hover:bg-red-700"><Download className="mr-2 h-4 w-4"/>Get 5% voucher</Button>
                )}
                {tier.name === "Gold" && (
                  <Button size="sm" variant="default" className="bg-red-600 hover:bg-red-700"><Download className="mr-2 h-4 w-4"/>Get 10% voucher</Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-5">
              <div className="text-sm text-slate-500">Trust & Safety</div>
              <div className="mt-2 flex items-center gap-2 text-red-600"><Shield className="h-5 w-5"/><span className="font-semibold">Tamper-evident</span></div>
              <p className="mt-1 text-xs text-slate-500">Deliveries are logged with a hash chain. GPS is privacy-safe (~1km).</p>
              <div className="mt-4">
                <Button size="sm" variant="outline" className="border-red-600 text-red-700 hover:bg-red-50" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
                  View verification log
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* NGO Story */}
        <Card className="rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3">
            <img src={NGO_SAMPLE.image} alt="NGO" className="h-full w-full object-cover md:col-span-1"/>
            <CardContent className="p-5 md:col-span-2">
              <div className="text-xs uppercase tracking-wide text-slate-500">You supported</div>
              <h2 className="mt-1 text-xl font-semibold">{NGO_SAMPLE.name} · {NGO_SAMPLE.area}</h2>
              <div className="mt-1 text-sm text-slate-600">{NGO_SAMPLE.stat}</div>
              <p className="mt-3 text-slate-700">“{NGO_SAMPLE.story}”</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                <Badge variant="secondary" className="bg-red-50 text-red-700 border border-red-200">Story verified</Badge>
                <Badge variant="secondary" className="bg-red-50 text-red-700 border border-red-200">Consent on file</Badge>
                <Badge variant="secondary" className="bg-red-50 text-red-700 border border-red-200">No child faces shown</Badge>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 bg-red-50 rounded-xl p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-lg">Overview</TabsTrigger>
            <TabsTrigger value="donations" className="data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-lg">Donations</TabsTrigger>
            <TabsTrigger value="verify" className="data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-lg">Verify Delivery</TabsTrigger>
            <TabsTrigger value="log" className="data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-lg">Verification Log</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <Card className="rounded-2xl shadow-sm">
              <CardContent className="p-5">
                <h3 className="text-xl font-semibold">Monthly Impact Report</h3>
                <ul className="mt-3 list-disc pl-5 text-sm text-slate-700 space-y-1">
                  <li>You donated <span className="font-medium">R{totalDonations.toFixed(0)}</span> this month.</li>
                  <li>That money contributed to <span className="font-medium">{mealsProvided} meals</span> across partner sites.</li>
                  <li>Highlight: <span className="font-medium">{NGO_SAMPLE.name}</span> in {NGO_SAMPLE.area}.</li>
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="default" className="bg-red-600 hover:bg-red-700" onClick={() => addDonation(10)}><RefreshCcw className="mr-2 h-4 w-4"/>Simulate R10 donation</Button>
                  <Button variant="outline" className="border-red-600 text-red-700 hover:bg-red-50" onClick={() => addDonation(50)}>Simulate R50 donation</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="donations" className="mt-4">
            <Card className="rounded-2xl shadow-sm">
              <CardContent className="p-5">
                <h3 className="text-xl font-semibold">Your Donation History</h3>
                <div className="mt-3 grid grid-cols-1 gap-2">
                  {donations.map((d) => (
                    <div key={d.id} className="flex items-center justify-between rounded-xl border bg-white p-3 text-sm">
                      <div className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-red-600"/>
                        <span>{d.date}</span>
                      </div>
                      <div className="font-medium">R{d.amount.toFixed(0)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verify" className="mt-4">
            <Card className="rounded-2xl shadow-sm">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2"><QrCode className="h-5 w-5"/>Log a Delivery (Field-side)</h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                  <div className="md:col-span-2">
                    <label className="text-xs text-slate-500">Site code</label>
                    <Input placeholder="e.g., KZN-EMD-004" value={siteCode} onChange={(e) => setSiteCode(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Meals delivered</label>
                    <Input type="number" placeholder="e.g., 150" value={mealCount} onChange={(e) => setMealCount(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">One-time PIN</label>
                    <Input placeholder="e.g., 924613" value={otp} onChange={(e) => setOtp(e.target.value)} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={verifyDelivery} className="bg-red-600 hover:bg-red-700">Submit & Anchor</Button>
                  <span className="text-xs text-slate-500">Signed by rotating community verifier</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="log" className="mt-4">
            <Card className="rounded-2xl shadow-sm">
              <CardContent className="p-5">
                <h3 className="text-lg font-semibold">Tamper‑Evident Verification Log</h3>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-slate-500">
                      <tr>
                        <th className="py-2 pr-4">#</th>
                        <th className="py-2 pr-4">Timestamp</th>
                        <th className="py-2 pr-4">Site</th>
                        <th className="py-2 pr-4">Meals</th>
                        <th className="py-2 pr-4">Verifier</th>
                        <th className="py-2 pr-4">Prev</th>
                        <th className="py-2 pr-4">Hash</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chain.map((e) => (
                        <tr key={e.idx} className="border-t">
                          <td className="py-2 pr-4">{e.idx}</td>
                          <td className="py-2 pr-4">{new Date(e.ts).toLocaleString()}</td>
                          <td className="py-2 pr-4">{'site' in e.payload ? e.payload.site : "—"}</td>
                          <td className="py-2 pr-4">{'meals' in e.payload ? e.payload.meals : "—"}</td>
                          <td className="py-2 pr-4">{'verifier' in e.payload ? e.payload.verifier : "—"}</td>
                          <td className="py-2 pr-4 font-mono text-xs">{e.prev.slice(0, 8)}…</td>
                          <td className="py-2 pr-4 font-mono text-xs">{e.hash.slice(0, 8)}…</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-xs text-slate-500">Any change to a row breaks all subsequent hashes – exposing tampering.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <footer className="py-6 text-center text-xs text-slate-500">Hackathon prototype · Local-first · Privacy by default</footer>
      </div>
    </div>
  );
}
