import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Mail, FileText, Download, Printer, Users, Check,
  User, ChevronRight, FileDown, Loader2
} from "lucide-react";
import { toast } from "sonner";

// Letter templates
const LETTER_TEMPLATES = {
  general_interest: {
    name: "General Interest in Purchasing",
    icon: "🏠",
    subject: "Cash Offer for Your Property at {{address}}",
    body: `Dear {{owner_name}},

I hope this letter finds you well. My name is [Your Name], and I am a local real estate investor actively purchasing properties in {{city}}, Florida.

I am writing to express my genuine interest in purchasing your property located at:

{{full_address}}
Folio #: {{folio_number}}

As a serious cash buyer, I can offer you a quick and hassle-free selling experience. There are no real estate agent commissions, no closing costs for you to pay, and no need for repairs or renovations.

If you have ever considered selling your property, I would welcome the opportunity to discuss this with you.

Please feel free to contact me at your earliest convenience:

Phone: [Your Phone]
Email: [Your Email]

Warm regards,

[Your Name]
[Your Company]`
  },
  convenience_flexible: {
    name: "Convenience & Flexible Options",
    icon: "⚡",
    subject: "A Stress-Free Way to Sell Your {{city}} Property",
    body: `Dear {{owner_name}},

Are you looking for a simple, stress-free way to sell your property? I specialize in making the home selling process as easy as possible for property owners like you.

Your Property:
{{full_address}}

Here's what I can offer you:

- CASH PURCHASE - No financing contingencies or delays
- FAST CLOSING - Close in as little as 7-14 days
- AS-IS CONDITION - No repairs needed
- NO FEES - I cover all closing costs
- FLEXIBLE TERMS - We work on your timeline

Please reach out at your convenience:
[Your Phone]

Best regards,

[Your Name]
[Your Company]`
  },
  life_changes: {
    name: "Life Changes & Transitions",
    icon: "🌅",
    subject: "Here to Help During Life's Transitions",
    body: `Dear {{owner_name}},

Life brings many changes. Whether you're dealing with a job relocation, family changes, retirement plans, or simply ready for a new chapter, selling a property can feel overwhelming.

I understand that your property at {{address}} may hold many memories.

That's why I want you to know that I'm here to help make this transition as smooth as possible:

- I buy properties in ANY condition
- I can close on YOUR timeline
- No showings or open houses
- I handle all paperwork and closing costs
- Cash offers with no financing delays

You can reach me at:
Phone: [Your Phone]
Email: [Your Email]

Wishing you all the best,

[Your Name]
[Your Company]`
  },
  property_specific: {
    name: "Property-Specific Interest",
    icon: "📍",
    subject: "Specifically Interested in {{address}}",
    body: `Dear {{owner_name}},

I am writing to you specifically about your property at:

{{full_address}}
{{city}}, FL {{zip}}

I've been actively investing in the {{city}} area, and your property caught my attention. I am a serious cash buyer prepared to make a fair offer.

Would you be open to a brief conversation about selling?

Please reach out at your convenience:
Phone: [Your Phone]
Email: [Your Email]

Sincerely,

[Your Name]
[Your Company]`
  },
  no_obligation: {
    name: "No Obligation / Informational",
    icon: "📋",
    subject: "Free Property Valuation for {{address}}",
    body: `Dear {{owner_name}},

I'm reaching out to property owners in {{city}} to offer a completely free, no-obligation property valuation.

Your Property:
{{full_address}}
Folio #: {{folio_number}}

What I'm Offering (100% Free, No Strings Attached):
- Current cash market value assessment
- Comparison to recent sales in your area
- No pressure, no sales pitch, just information

Contact me anytime:
Phone: [Your Phone]
Email: [Your Email]

Best wishes,

[Your Name]
[Your Company]`
  }
};

export default function BulkLetterGenerator({ 
  properties = [], 
  isOpen, 
  onClose,
  onComplete
}) {
  const [selectedTemplate, setSelectedTemplate] = useState('general_interest');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [senderInfo, setSenderInfo] = useState(() => {
    const saved = localStorage.getItem('letterSenderInfo');
    return saved ? JSON.parse(saved) : { name: '', company: '', phone: '', email: '' };
  });

  const saveSenderInfo = () => {
    localStorage.setItem('letterSenderInfo', JSON.stringify(senderInfo));
    toast.success('Sender information saved');
  };

  // Generate letter content for a single property
  const generateLetterForProperty = (property, template) => {
    const fullAddress = [
      property.situs_street_number,
      property.situs_street_name,
      property.situs_street_type
    ].filter(Boolean).join(' ');

    const variables = {
      owner_name: property.name_line_1 || 'Property Owner',
      address: fullAddress,
      full_address: `${fullAddress}\n${property.situs_city || ''}, FL ${property.situs_zip || ''}`,
      city: property.situs_city || 'Broward County',
      zip: property.situs_zip || '',
      folio_number: property.folio_number || '',
      mailing_address: [
        property.mailing_address_line_1,
        property.mailing_address_line_2,
        [property.mailing_city, property.mailing_state].filter(Boolean).join(', '),
        property.mailing_zip
      ].filter(Boolean).join('\n')
    };

    let subject = template.subject;
    let body = template.body;

    // Replace variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      subject = subject.replace(regex, value);
      body = body.replace(regex, value);
    });

    // Replace sender info
    body = body.replace(/\[Your Name\]/g, senderInfo.name || '[Your Name]');
    body = body.replace(/\[Your Company\]/g, senderInfo.company || '[Your Company]');
    body = body.replace(/\[Your Phone\]/g, senderInfo.phone || '[Your Phone]');
    body = body.replace(/\[Your Email\]/g, senderInfo.email || '[Your Email]');

    return {
      recipient: {
        name: property.name_line_1 || 'Property Owner',
        address: variables.mailing_address
      },
      subject,
      body,
      folio: property.folio_number
    };
  };

  // Generate all letters and download as a single file
  const handleGenerateAll = async () => {
    setIsGenerating(true);
    setProgress(0);

    const template = LETTER_TEMPLATES[selectedTemplate];
    const letters = [];
    const date = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });

    for (let i = 0; i < properties.length; i++) {
      const letter = generateLetterForProperty(properties[i], template);
      letters.push(letter);
      setProgress(Math.round(((i + 1) / properties.length) * 100));
      
      // Small delay to show progress
      if (i % 10 === 0) {
        await new Promise(r => setTimeout(r, 10));
      }
    }

    // Create combined document
    const combinedContent = letters.map((letter, index) => `
================================================================================
LETTER ${index + 1} of ${letters.length}
Folio: ${letter.folio}
================================================================================

Date: ${date}

TO:
${letter.recipient.name}
${letter.recipient.address}

SUBJECT: ${letter.subject}

${letter.body}

--- END OF LETTER ${index + 1} ---
`).join('\n\n');

    // Download combined file
    const blob = new Blob([combinedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bulk_Letters_${properties.length}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    setIsGenerating(false);
    toast.success(`Generated ${properties.length} letters`);
    onComplete?.();
    onClose();
  };

  // Generate CSV for mail merge
  const handleExportCSV = () => {
    const template = LETTER_TEMPLATES[selectedTemplate];
    
    const headers = [
      'Folio',
      'Owner Name',
      'Mailing Address Line 1',
      'Mailing Address Line 2', 
      'Mailing City',
      'Mailing State',
      'Mailing Zip',
      'Property Address',
      'Property City',
      'Property Zip',
      'Subject',
      'Letter Body'
    ];

    const rows = properties.map(property => {
      const letter = generateLetterForProperty(property, template);
      return [
        property.folio_number || '',
        property.name_line_1 || '',
        property.mailing_address_line_1 || '',
        property.mailing_address_line_2 || '',
        property.mailing_city || '',
        property.mailing_state || '',
        property.mailing_zip || '',
        [property.situs_street_number, property.situs_street_name, property.situs_street_type].filter(Boolean).join(' '),
        property.situs_city || '',
        property.situs_zip || '',
        letter.subject,
        letter.body.replace(/\n/g, ' ').replace(/"/g, '""')
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mail_Merge_${properties.length}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`Exported ${properties.length} records for mail merge`);
  };

  const currentTemplate = LETTER_TEMPLATES[selectedTemplate];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-violet-50 to-purple-50 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                Bulk Letter Generator
              </DialogTitle>
              <p className="text-sm text-slate-500 mt-0.5">
                Generate letters for {properties.length} selected properties
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex h-[calc(90vh-220px)]">
          {/* Left Panel - Template Selection */}
          <div className="w-80 border-r bg-slate-50/50 flex flex-col overflow-hidden">
            <div className="p-4 pb-2">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Select Template
              </h3>
            </div>
            
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-2 pb-4">
                {Object.entries(LETTER_TEMPLATES).map(([key, template]) => (
                  <Card 
                    key={key}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTemplate === key 
                        ? 'ring-2 ring-violet-500 bg-violet-50' 
                        : 'hover:bg-white'
                    }`}
                    onClick={() => setSelectedTemplate(key)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{template.icon}</span>
                        <p className="font-medium text-sm text-slate-800">
                          {template.name}
                        </p>
                        {selectedTemplate === key && (
                          <Check className="h-4 w-4 text-violet-600 ml-auto" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Sender Info */}
              <div className="space-y-3 pb-4">
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Your Info
                </h3>
                <Input
                  placeholder="Your Name"
                  value={senderInfo.name}
                  onChange={(e) => setSenderInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="h-8 text-sm"
                />
                <Input
                  placeholder="Company Name"
                  value={senderInfo.company}
                  onChange={(e) => setSenderInfo(prev => ({ ...prev, company: e.target.value }))}
                  className="h-8 text-sm"
                />
                <Input
                  placeholder="Phone Number"
                  value={senderInfo.phone}
                  onChange={(e) => setSenderInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="h-8 text-sm"
                />
                <Input
                  placeholder="Email Address"
                  value={senderInfo.email}
                  onChange={(e) => setSenderInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="h-8 text-sm"
                />
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={saveSenderInfo}
                  className="w-full text-xs"
                >
                  Save Info
                </Button>
              </div>
            </ScrollArea>
          </div>

          {/* Right Panel - Preview & Actions */}
          <div className="flex-1 flex flex-col p-6">
            {/* Selected Properties Summary */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Selected Properties</h3>
              <div className="bg-slate-50 rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-violet-100 text-violet-700">
                      {properties.length} properties selected
                    </Badge>
                  </div>
                </div>
                <ScrollArea className="h-32">
                  <div className="space-y-1">
                    {properties.slice(0, 20).map((prop, i) => (
                      <div key={prop.folio_number || i} className="text-xs text-slate-600 flex items-center gap-2">
                        <ChevronRight className="h-3 w-3 text-slate-400" />
                        <span className="font-mono">{prop.folio_number}</span>
                        <span className="text-slate-400">-</span>
                        <span className="truncate">{prop.name_line_1}</span>
                      </div>
                    ))}
                    {properties.length > 20 && (
                      <div className="text-xs text-slate-500 italic mt-2">
                        ... and {properties.length - 20} more
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Template Preview */}
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Template Preview</h3>
              <div className="bg-white rounded-lg border p-4 h-48 overflow-auto">
                <Badge className="mb-2">{currentTemplate.icon} {currentTemplate.name}</Badge>
                <p className="text-sm font-medium text-slate-800 mb-2">
                  Subject: {currentTemplate.subject}
                </p>
                <p className="text-xs text-slate-500 whitespace-pre-wrap line-clamp-6">
                  {currentTemplate.body.substring(0, 300)}...
                </p>
              </div>
            </div>

            {/* Progress */}
            {isGenerating && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-600">Generating letters...</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-4 border-t bg-slate-50 flex items-center justify-between">
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>
            Cancel
          </Button>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleExportCSV}
              disabled={isGenerating}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export CSV (Mail Merge)
            </Button>
            <Button 
              onClick={handleGenerateAll}
              disabled={isGenerating}
              className="bg-gradient-to-r from-violet-600 to-purple-600"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Generate All Letters
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

