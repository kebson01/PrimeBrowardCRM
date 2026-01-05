import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  DollarSign, TrendingUp, TrendingDown, Home, Calendar, 
  Calculator, PiggyBank, Target, Info, Percent, Building2,
  ArrowRight, Sparkles, CheckCircle2, AlertCircle
} from "lucide-react";

// Format currency
const formatCurrency = (value) => {
  if (!value && value !== 0) return '—';
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD', 
    maximumFractionDigits: 0 
  }).format(value);
};

// Format percentage
const formatPercent = (value) => {
  if (!value && value !== 0) return '—';
  return `${value.toFixed(1)}%`;
};

// Parse sale date
const parseSaleDate = (dateStr) => {
  if (!dateStr) return null;
  // Handle various date formats
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return new Date(parts[2], parts[0] - 1, parts[1]);
  }
  return new Date(dateStr);
};

export default function FinancialAnalysis({ property }) {
  // Wholesale deal calculator state
  const [arvOverride, setArvOverride] = useState('');
  const [repairEstimate, setRepairEstimate] = useState(15000);
  const [wholesaleFee, setWholesaleFee] = useState(10000);
  const [arvPercent, setArvPercent] = useState(70);

  // Calculate financial metrics
  const analysis = useMemo(() => {
    if (!property) return null;

    const currentValue = property.just_value || 0;
    const purchasePrice = property.estimated_purchase_price || 0;
    const landValue = property.just_land_value || 0;
    const buildingValue = property.just_building_value || 0;
    const sqft = property.bldg_tot_sq_footage || 0;
    const yearBuilt = property.bldg_year_built || 0;
    const saleDate = parseSaleDate(property.sale_date_1);
    
    // Years owned
    const yearsOwned = saleDate 
      ? Math.max(0, (new Date().getFullYear() - saleDate.getFullYear()))
      : null;

    // Equity calculations
    const equity = currentValue - purchasePrice;
    const equityPercent = purchasePrice > 0 ? (equity / purchasePrice) * 100 : 0;
    
    // Annual appreciation
    const annualAppreciation = yearsOwned && yearsOwned > 0 
      ? equity / yearsOwned 
      : null;
    const annualAppreciationPercent = yearsOwned && yearsOwned > 0 && purchasePrice > 0
      ? (Math.pow(currentValue / purchasePrice, 1 / yearsOwned) - 1) * 100
      : null;

    // Price per sq ft
    const pricePerSqFt = sqft > 0 ? currentValue / sqft : null;

    // Property age
    const propertyAge = yearBuilt > 0 
      ? new Date().getFullYear() - yearBuilt 
      : null;

    // ARV for wholesale calculations (use override or current value)
    const arv = arvOverride ? parseFloat(arvOverride) : currentValue;
    
    // Maximum Allowable Offer (MAO) = ARV × % - Repairs - Wholesale Fee
    const mao = (arv * (arvPercent / 100)) - repairEstimate - wholesaleFee;
    
    // Potential profit if buying at MAO
    const potentialProfit = arv - mao - repairEstimate;

    // Deal score (simple scoring based on equity and other factors)
    let dealScore = 0;
    if (equityPercent >= 30) dealScore += 30;
    else if (equityPercent >= 20) dealScore += 20;
    else if (equityPercent >= 10) dealScore += 10;
    
    if (property.is_absentee_owner) dealScore += 20;
    if (!property.homestead_flag) dealScore += 10;
    if (yearsOwned && yearsOwned >= 10) dealScore += 15;
    if (propertyAge && propertyAge >= 30) dealScore += 10;
    if (mao > 0 && mao <= purchasePrice * 0.8) dealScore += 15;

    return {
      currentValue,
      purchasePrice,
      landValue,
      buildingValue,
      equity,
      equityPercent,
      yearsOwned,
      annualAppreciation,
      annualAppreciationPercent,
      pricePerSqFt,
      sqft,
      propertyAge,
      yearBuilt,
      saleDate,
      arv,
      mao,
      potentialProfit,
      dealScore
    };
  }, [property, arvOverride, repairEstimate, wholesaleFee, arvPercent]);

  if (!property || !analysis) return null;

  const getDealScoreColor = (score) => {
    if (score >= 70) return 'text-emerald-600 bg-emerald-50';
    if (score >= 50) return 'text-amber-600 bg-amber-50';
    return 'text-slate-600 bg-slate-50';
  };

  const getDealScoreLabel = (score) => {
    if (score >= 70) return 'Hot Deal';
    if (score >= 50) return 'Good Potential';
    return 'Research More';
  };

  return (
    <div className="space-y-6">
      {/* Deal Score Banner */}
      <div className={`p-4 rounded-xl border ${getDealScoreColor(analysis.dealScore)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-white/80 flex items-center justify-center shadow-sm">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium opacity-80">Deal Score</p>
              <p className="text-2xl font-bold">{analysis.dealScore}/100</p>
            </div>
          </div>
          <Badge className={`${getDealScoreColor(analysis.dealScore)} text-sm px-3 py-1`}>
            {getDealScoreLabel(analysis.dealScore)}
          </Badge>
        </div>
      </div>

      {/* Purchase vs Current Value */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            Equity Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {/* Purchase Price */}
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Paid</p>
              <p className="text-xl font-bold text-slate-800">
                {formatCurrency(analysis.purchasePrice)}
              </p>
              {analysis.saleDate && (
                <p className="text-xs text-slate-500 mt-1">
                  {analysis.saleDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              )}
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center">
                <ArrowRight className="h-6 w-6 text-slate-400" />
                <p className="text-xs text-slate-500 mt-1">
                  {analysis.yearsOwned ? `${analysis.yearsOwned} yrs` : '—'}
                </p>
              </div>
            </div>

            {/* Current Value */}
            <div className="text-center p-4 bg-emerald-50 rounded-xl">
              <p className="text-xs text-emerald-600 uppercase tracking-wide mb-1">Now Worth</p>
              <p className="text-xl font-bold text-emerald-700">
                {formatCurrency(analysis.currentValue)}
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                County Assessed
              </p>
            </div>
          </div>

          {/* Equity Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">Potential Equity</span>
              <span className={`font-bold ${analysis.equity >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(analysis.equity)}
                <span className="text-xs ml-1">
                  ({formatPercent(analysis.equityPercent)})
                </span>
              </span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  analysis.equityPercent >= 30 ? 'bg-emerald-500' :
                  analysis.equityPercent >= 15 ? 'bg-amber-500' :
                  analysis.equityPercent >= 0 ? 'bg-slate-400' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, analysis.equityPercent))}%` }}
              />
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">Annual Appreciation</p>
              <p className="font-semibold text-slate-800">
                {analysis.annualAppreciation 
                  ? `${formatCurrency(analysis.annualAppreciation)}/yr`
                  : '—'}
              </p>
              {analysis.annualAppreciationPercent && (
                <p className="text-xs text-emerald-600">
                  +{formatPercent(analysis.annualAppreciationPercent)} per year
                </p>
              )}
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">Price per Sq Ft</p>
              <p className="font-semibold text-slate-800">
                {analysis.pricePerSqFt 
                  ? `$${analysis.pricePerSqFt.toFixed(0)}/sqft`
                  : '—'}
              </p>
              {analysis.sqft > 0 && (
                <p className="text-xs text-slate-500">
                  {analysis.sqft.toLocaleString()} sq ft total
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Value Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            Value Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Land Value</span>
              <span className="font-semibold">{formatCurrency(analysis.landValue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Building Value</span>
              <span className="font-semibold">{formatCurrency(analysis.buildingValue)}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-800">Total Just Value</span>
              <span className="font-bold text-lg">{formatCurrency(analysis.currentValue)}</span>
            </div>
          </div>
          
          {/* Value Distribution Bar */}
          {analysis.currentValue > 0 && (
            <div className="mt-4">
              <div className="h-4 rounded-full overflow-hidden flex">
                <div 
                  className="bg-amber-400 h-full"
                  style={{ width: `${(analysis.landValue / analysis.currentValue) * 100}%` }}
                />
                <div 
                  className="bg-blue-500 h-full"
                  style={{ width: `${(analysis.buildingValue / analysis.currentValue) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded bg-amber-400"></span>
                  Land ({((analysis.landValue / analysis.currentValue) * 100).toFixed(0)}%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded bg-blue-500"></span>
                  Building ({((analysis.buildingValue / analysis.currentValue) * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wholesale Deal Calculator */}
      <Card className="border-violet-200 bg-gradient-to-br from-violet-50/50 to-purple-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Calculator className="h-4 w-4 text-violet-600" />
            Wholesale Deal Calculator
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3.5 w-3.5 text-slate-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Calculate your Maximum Allowable Offer (MAO) for this property based on ARV and repair costs.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ARV Input */}
          <div>
            <div className="flex justify-between mb-2">
              <Label className="text-sm">After Repair Value (ARV)</Label>
              <span className="text-xs text-slate-500">
                Using: {arvOverride ? 'Custom' : 'County Value'}
              </span>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="number"
                  placeholder={analysis.currentValue.toString()}
                  value={arvOverride}
                  onChange={(e) => setArvOverride(e.target.value)}
                  className="pl-9"
                />
              </div>
              {arvOverride && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setArvOverride('')}
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* ARV Percentage */}
          <div>
            <div className="flex justify-between mb-2">
              <Label className="text-sm">ARV Percentage</Label>
              <span className="font-medium text-violet-600">{arvPercent}%</span>
            </div>
            <Slider
              value={[arvPercent]}
              onValueChange={(value) => setArvPercent(value[0])}
              min={50}
              max={80}
              step={5}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>Conservative (50%)</span>
              <span>Standard (70%)</span>
              <span>Aggressive (80%)</span>
            </div>
          </div>

          {/* Repair Estimate */}
          <div>
            <Label className="text-sm mb-2 block">Estimated Repairs</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="number"
                value={repairEstimate}
                onChange={(e) => setRepairEstimate(parseFloat(e.target.value) || 0)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Wholesale Fee */}
          <div>
            <Label className="text-sm mb-2 block">Your Wholesale Fee</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="number"
                value={wholesaleFee}
                onChange={(e) => setWholesaleFee(parseFloat(e.target.value) || 0)}
                className="pl-9"
              />
            </div>
          </div>

          <Separator />

          {/* Results */}
          <div className="space-y-3 pt-2">
            {/* MAO Calculation */}
            <div className="p-4 bg-white rounded-xl border border-violet-200">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                Maximum Allowable Offer (MAO)
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-violet-700">
                  {formatCurrency(analysis.mao)}
                </p>
                {analysis.mao < analysis.purchasePrice && (
                  <Badge className="bg-emerald-100 text-emerald-700">
                    Below Purchase Price
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                = ({formatCurrency(analysis.arv)} × {arvPercent}%) - {formatCurrency(repairEstimate)} - {formatCurrency(wholesaleFee)}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-xs text-slate-500">Buyer's Potential Profit</p>
                <p className="font-bold text-emerald-600">
                  {formatCurrency(analysis.potentialProfit)}
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-xs text-slate-500">Your Wholesale Fee</p>
                <p className="font-bold text-violet-600">
                  {formatCurrency(wholesaleFee)}
                </p>
              </div>
            </div>

            {/* Deal Viability Check */}
            <div className={`p-3 rounded-lg flex items-center gap-2 ${
              analysis.mao > 0 && analysis.mao <= analysis.purchasePrice * 0.9
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-amber-50 text-amber-700'
            }`}>
              {analysis.mao > 0 && analysis.mao <= analysis.purchasePrice * 0.9 ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">
                    Good deal potential - MAO is below what they paid
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">
                    May need motivated seller - MAO is above purchase price
                  </span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

