"use client";

import React, { useMemo, useState } from "react";
import {
  Edit, Trash2, Copy, Eye, EyeOff, Search, Percent, Users, Calendar,
  IndianRupee, Clock, AlertCircle, CheckCircle, XCircle
} from "lucide-react";
import toast from "react-hot-toast";

import { ICoupon } from "@/interfaces";
import { deleteCoupon, updateCoupon } from "@/actions/coupons";
import { Button }    from "@/components/ui/button";
import { Badge }     from "@/components/ui/badge";
import { Input }     from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface Props {
  coupons:    ICoupon[];
  onEdit:    (c: ICoupon) => void;
  onUpdate:  () => void;
  isEnabled: boolean;
}

type Filter = "all" | "active" | "inactive" | "expired" | "unlimited";
type Sort   = "newest" | "oldest" | "usage"  | "expiry";

export default function CouponList({ coupons, onEdit, onUpdate, isEnabled }: Props) {
  /* -------------------- state -------------------- */
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort,   setSort]   = useState<Sort>("newest");

  /* ------------------- helpers ------------------- */
  const badgeInfo = (c: ICoupon) => {
    const now = new Date();
    if (!c.is_active)
      return { txt: "inactive", clr: "bg-gray-200 dark:bg-gray-700 text-black-400", Icon: XCircle };

    if (c.valid_until && new Date(c.valid_until) < now)
      return { txt: "expired", clr: "bg-red-200  dark:bg-red-800 text-black-400",   Icon: AlertCircle };

    if (c.usage_limit && c.used_count >= c.usage_limit)
      return { txt: "limit",   clr: "bg-orange-200 dark:bg-orange-800 text-black-400", Icon: AlertCircle };

    // brighter “active” badge
    return { txt: "active",   clr: "bg-emerald-200 dark:bg-emerald-700 text-black-400", Icon: CheckCircle };
  };

  const usagePct = (c: ICoupon) =>
    c.usage_limit ? Math.min((c.used_count / c.usage_limit) * 100, 100) : 0;

  /* --------------- filtering / sorting ----------- */
  const rows = useMemo(() => {
    const now = new Date();
    let out = coupons.filter(c =>
      (c.code      .toLowerCase().includes(search.toLowerCase())) ||
      (c.name ?? ""        ).toLowerCase().includes(search.toLowerCase()) ||
      (c.description ?? "").toLowerCase().includes(search.toLowerCase())
    ).filter(c => {
      switch (filter) {
        case "active"   : return c.is_active && (!c.valid_until || new Date(c.valid_until) > now);
        case "inactive" : return !c.is_active;
        case "expired"  : return c.valid_until && new Date(c.valid_until) <  now;
        case "unlimited": return !c.usage_limit;
        default         : return true;
      }
    });

    out.sort((a,b) => {
      switch (sort) {
        case "oldest": return +new Date(a.created_at) - +new Date(b.created_at);
        case "usage" : return b.used_count - a.used_count;
        case "expiry":
          return (+new Date(a.valid_until || 0)||9e15) -
                 (+new Date(b.valid_until || 0)||9e15);
        default     : return +new Date(b.created_at) - +new Date(a.created_at);
      }
    });
    return out;
  }, [coupons, search, filter, sort]);

  /* ------------------- actions ------------------- */
  const toggle = async (c: ICoupon) => {
    const { success, message } = await updateCoupon(c.id, { is_active: !c.is_active });
    toast[success ? "success" : "error"](success ? "Status updated 🎯" : message);
    success && onUpdate();
  };

  const del = async (id:number) => {
    if (!confirm("Delete this coupon permanently?")) return;
    const { success, message } = await deleteCoupon(id);
    toast[success ? "success" : "error"](success ? "Deleted 🗑️" : message);
    success && onUpdate();
  };

  const copy = (code:string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard 📋");
  };

  /* ------------------ render --------------------- */
  if (!isEnabled)
    return <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
             Coupons are disabled in settings.
           </p>;

  return (
    <div className="px-3 sm:px-0 space-y-4">
      {/* ---- controls ---- */}
      <div className="space-y-2 sm:flex sm:space-y-0 sm:gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={e=>setSearch(e.target.value)}
            placeholder="Search coupons…"
            className="pl-9 h-9 text-xs sm:text-sm"
          />
        </div>

        <select value={filter} onChange={e=>setFilter(e.target.value as Filter)}
          className="h-9 border rounded-md px-2 text-xs sm:text-sm">
          {["All","Active","inactive","Expired","Unlimited"].map(o=> <option key={o}>{o}</option>)}
        </select>

        <select value={sort} onChange={e=>setSort(e.target.value as Sort)}
          className="h-9 border rounded-md px-2 text-xs sm:text-sm">
          {["Newest","Oldest","Usage","Expiry"].map(o=> <option key={o}>{o}</option>)}
        </select>
      </div>

      {/* ---- cards ---- */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map(c=>{
          const {Icon, clr, txt} = badgeInfo(c);
          return (
            <Card key={c.id}>
              <CardContent className="p-4 space-y-3 text-xs">
                {/* header */}
                <div className="flex justify-between">
                  <div>
                    <div className="flex items-center gap-1">
                      <code className="bg-slate-300 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                        {c.code}
                      </code>
                      <Button size="icon" variant="ghost" className="h-5 w-5" onClick={()=>copy(c.code)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    {c.name && <p className="font-semibold line-clamp-1">{c.name}</p>}
                    
                    
                  </div>
                  <Badge className={`${clr} capitalize flex items-center`}>
                    <Icon className="h-3 w-3 mr-1"/>{txt}
                  </Badge>
                </div>

                {/* discount */}
                <div className="flex justify-between bg-orange-100 dark:bg-orange-900/30 p-2 rounded">
                  <span>Discount</span>
                  <span className="font-semibold text-orange-600">
                    {c.discount_type==="percentage"?`${c.discount_value}%`:`₹${c.discount_value}`}
                  </span>
                </div>

                {/* usage */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-1"><Users className="h-3 w-3"/>Usage</div>
                    <span className="font-semibold">
                      {c.used_count}{c.usage_limit?` / ${c.usage_limit}`:" /∞"}
                    </span>
                  </div>
                  {c.usage_limit &&
                    <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full">
                      <div className="h-1.5 bg-green-500 rounded-full" style={{width:`${usagePct(c)}%`}}/>
                    </div>}
                </div>

                {/* validity */}
                {(c.valid_from||c.valid_until) &&
                 <div className="flex items-center gap-1">
                   <Calendar className="h-3 w-3"/>
                   {c.valid_from && new Date(c.valid_from).toLocaleDateString()}
                   {c.valid_from && c.valid_until && " – "}
                   {c.valid_until && new Date(c.valid_until).toLocaleDateString()}
                 </div>}

                {/* actions */}
                <div className="grid gap-1 pt-2 border-t">
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="flex-1" onClick={()=>onEdit(c)}>
                      <Edit className="h-3 w-3 mr-1"/>Edit
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={()=>toggle(c)}>
                      {c.is_active
                        ? <> <EyeOff className="h-3 w-3 mr-1"/>Disable </>
                        : <> <Eye    className="h-3 w-3 mr-1"/>Enable  </>}
                    </Button>
                  </div>
                  <Button size="sm" variant="outline" className="text-red-600 mt-1" onClick={()=>del(c.id)}>
                    <Trash2 className="h-3 w-3 mr-1"/>Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {rows.length===0 &&
        <p className="text-center py-8 text-sm text-slate-500">No coupons match your criteria.</p>}
    </div>
  );
}
