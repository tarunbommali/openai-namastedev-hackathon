import React, { useState } from "react";
import { Award } from "lucide-react";
import { api } from "../../../api";
import { useAuth } from "../../../providers/AuthProvider";
import { useCandidateContext } from "../CandidateLayout";
import { PageLoadingSpinner } from "../../shared/components/feedback/LoadingSpinner";

export default function OffersPage() {
  const { token } = useAuth();
  const { offers, loading, refresh, addToast } = useCandidateContext();
  const [responding, setResponding] = useState(false);

  async function respondOffer(offerId, decision) {
    setResponding(true);
    try {
      await api(`/api/candidate/offers/${offerId}/respond`, {
        method: "POST",
        body: JSON.stringify({ decision })
      }, token);
      addToast(`Offer ${decision === "Accepted" ? "accepted" : "declined"} successfully`, "success");
      await refresh();
    } catch (e) {
      addToast(e.message, "error");
    } finally {
      setResponding(false);
    }
  }

  if (loading) return <PageLoadingSpinner />;

  return (
    <div className="space-y-6">
      {offers.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 space-y-3">
          <Award className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">No Job Offers Yet</p>
          <p className="text-xs text-slate-500">Official offer letters appear here upon recruiter selection and decision approval.</p>
        </div>
      ) : (
        offers.map((off) => (
          <div key={off.publicId || off.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {off.status || "Pending Action"}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-2">{off.subject || "Official Offer Letter"}</h3>
              </div>
            </div>

            <pre className="bg-slate-50 text-slate-800 text-xs font-mono p-4 rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed">
              {off.body}
            </pre>

            {off.status !== "Accepted" && off.status !== "Rejected" && (
              <div className="flex items-center gap-3 pt-2">
                <button
                  disabled={responding}
                  onClick={() => respondOffer(off.publicId || off.id, "Accepted")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-sm transition-colors"
                >
                  Accept Offer
                </button>
                <button
                  disabled={responding}
                  onClick={() => respondOffer(off.publicId || off.id, "Rejected")}
                  className="bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 font-bold text-xs px-6 py-2.5 rounded-lg shadow-sm transition-colors"
                >
                  Decline Offer
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
