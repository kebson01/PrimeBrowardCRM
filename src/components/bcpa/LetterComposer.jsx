import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, FileText, Send, Download, Printer, Copy, Check, 
  User, MapPin, Home, Sparkles, Edit3, Eye
} from "lucide-react";
import { toast } from "sonner";

// Letter templates organized by category
const LETTER_TEMPLATES = {
  general_interest: {
    name: "General Interest in Purchasing",
    icon: "🏠",
    color: "blue",
    description: "Express general interest in purchasing their property",
    subject: "Cash Offer for Your Property at {{address}}",
    body: `Dear {{owner_name}},

I hope this letter finds you well. My name is [Your Name], and I am a local real estate investor actively purchasing properties in {{city}}, Florida.

I am writing to express my genuine interest in purchasing your property located at:

{{full_address}}
Folio #: {{folio_number}}

As a serious cash buyer, I can offer you a quick and hassle-free selling experience. There are no real estate agent commissions, no closing costs for you to pay, and no need for repairs or renovations.

If you have ever considered selling your property, I would welcome the opportunity to discuss this with you. Even if you're not ready to sell today, I'd be happy to provide you with a no-obligation cash offer for your consideration.

Please feel free to contact me at your earliest convenience:

Phone: [Your Phone]
Email: [Your Email]

Thank you for your time, and I look forward to hearing from you.

Warm regards,

[Your Name]
[Your Company]`
  },

  convenience_flexible: {
    name: "Convenience & Flexible Options",
    icon: "⚡",
    color: "amber",
    description: "Highlight convenience and flexible selling options",
    subject: "A Stress-Free Way to Sell Your {{city}} Property",
    body: `Dear {{owner_name}},

Are you looking for a simple, stress-free way to sell your property? I specialize in making the home selling process as easy as possible for property owners like you.

Your Property:
{{full_address}}

Here's what I can offer you:

✓ CASH PURCHASE - No financing contingencies or delays
✓ FAST CLOSING - Close in as little as 7-14 days, or on your timeline
✓ AS-IS CONDITION - No repairs, cleaning, or renovations needed
✓ NO FEES - I cover all closing costs and there are no agent commissions
✓ FLEXIBLE TERMS - Need to stay in the home longer? We can work that out

Whether you need to sell quickly or just want a hassle-free experience, I'm here to help. Many homeowners appreciate the convenience of a direct sale without the typical headaches of listing on the market.

I would love to learn more about your situation and see if I can help. There's absolutely no pressure or obligation.

To get started, simply give me a call or send me a text:
[Your Phone]

Looking forward to connecting with you!

Best regards,

[Your Name]
[Your Company]`
  },

  life_changes: {
    name: "Life Changes & Transitions",
    icon: "🌅",
    color: "violet",
    description: "Sensitive approach for life transition situations",
    subject: "Here to Help During Life's Transitions",
    body: `Dear {{owner_name}},

Life brings many changes – some planned, some unexpected. Whether you're dealing with a job relocation, family changes, retirement plans, or simply ready for a new chapter, selling a property during these times can feel overwhelming.

I understand that your property at {{address}} may hold many memories, and the decision to sell is never taken lightly.

That's why I want you to know that I'm here to help make this transition as smooth as possible:

• I buy properties in ANY condition – no repairs or updates needed
• I can close on YOUR timeline – whether that's 2 weeks or 2 months
• No showings, no open houses, no strangers walking through your home
• I handle all the paperwork and closing costs
• Cash offers with no financing delays

My goal is to provide you with a fair offer and a stress-free experience during what can be a challenging time. There's no pressure and no obligation – just a straightforward conversation about your options.

If you'd like to explore what a sale might look like, I'm happy to meet at your convenience or simply chat over the phone.

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
    color: "emerald",
    description: "Show specific interest in their particular property",
    subject: "Specifically Interested in {{address}}",
    body: `Dear {{owner_name}},

I am writing to you specifically about your property at:

{{full_address}}
{{city}}, FL {{zip}}

I've been actively investing in the {{city}} area, and your property caught my attention for several reasons:

• Location: The {{city}} neighborhood is exactly where I'm looking to invest
• Property Type: {{use_type}} properties like yours are in high demand
• Potential: I see great value in properties like yours

Property Details I Have on File:
- Folio Number: {{folio_number}}
- Assessed Value: {{just_value}}
- Year Built: {{year_built}}
- Square Footage: {{sqft}} sq ft

I am a serious cash buyer prepared to make a fair offer based on current market conditions. Unlike traditional buyers, I don't need bank approval or lengthy inspections, which means a faster, more certain closing.

Would you be open to a brief conversation about selling? Even if you're not ready now, I'd be happy to provide a no-obligation offer for your future reference.

Please reach out at your convenience:
Phone: [Your Phone]
Email: [Your Email]

Thank you for considering my inquiry.

Sincerely,

[Your Name]
[Your Company]`
  },

  no_obligation: {
    name: "No Obligation / Informational",
    icon: "📋",
    color: "slate",
    description: "Low-pressure informational outreach",
    subject: "Free Property Valuation for {{address}}",
    body: `Dear {{owner_name}},

I hope this letter finds you well. I'm reaching out to property owners in {{city}} to offer a completely free, no-obligation property valuation.

Your Property:
{{full_address}}
Folio #: {{folio_number}}

Why am I offering this?

As a local real estate investor, I'm always looking for properties in Broward County. Even if you have no intention of selling today, knowing your property's current market value can be valuable information for:

• Future planning and financial decisions
• Estate and inheritance planning
• Refinancing considerations
• Understanding your home's equity position

What I'm Offering (100% Free, No Strings Attached):
✓ Current cash market value assessment
✓ Comparison to recent sales in your area
✓ No pressure, no sales pitch, just information

If you're curious about what your property might be worth in today's market, I'd be happy to provide this information. Simply give me a call or send a text, and I can usually provide a preliminary estimate within 24-48 hours.

Contact me anytime:
Phone: [Your Phone]
Email: [Your Email]

Whether you ever decide to sell or not, I hope this offer is helpful to you.

Best wishes,

[Your Name]
[Your Company]

P.S. - This is purely informational. There is absolutely no obligation or pressure to sell.`
  }
};

export default function LetterComposer({ 
  property, 
  isOpen, 
  onClose 
}) {
  const [selectedTemplate, setSelectedTemplate] = useState('general_interest');
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [senderInfo, setSenderInfo] = useState({
    name: '',
    company: '',
    phone: '',
    email: ''
  });

  // Load sender info from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('letterSenderInfo');
    if (saved) {
      setSenderInfo(JSON.parse(saved));
    }
  }, []);

  // Save sender info to localStorage
  const saveSenderInfo = () => {
    localStorage.setItem('letterSenderInfo', JSON.stringify(senderInfo));
    toast.success('Sender information saved');
  };

  // Build property variables for template replacement
  const propertyVariables = useMemo(() => {
    if (!property) return {};
    
    const fullAddress = [
      property.situs_street_number,
      property.situs_street_name,
      property.situs_street_type
    ].filter(Boolean).join(' ');

    const mailingAddress = [
      property.mailing_address_line_1,
      property.mailing_address_line_2,
      [property.mailing_city, property.mailing_state].filter(Boolean).join(', '),
      property.mailing_zip
    ].filter(Boolean).join('\n');

    return {
      owner_name: property.name_line_1 || 'Property Owner',
      owner_name_2: property.name_line_2 || '',
      address: fullAddress,
      full_address: `${fullAddress}\n${property.situs_city || ''}, FL ${property.situs_zip || ''}`,
      city: property.situs_city || 'Broward County',
      zip: property.situs_zip || '',
      folio_number: property.folio_number || '',
      use_type: property.use_type || 'Residential',
      just_value: property.just_value ? `$${property.just_value.toLocaleString()}` : 'N/A',
      year_built: property.bldg_year_built || '',
      sqft: property.bldg_tot_sq_footage?.toLocaleString() || '',
      beds: property.beds || '',
      baths: property.baths || '',
      mailing_address: mailingAddress,
      mailing_city: property.mailing_city || '',
      mailing_state: property.mailing_state || '',
      mailing_zip: property.mailing_zip || ''
    };
  }, [property]);

  // Replace template variables with actual values
  const replaceVariables = (text) => {
    let result = text;
    
    // Replace property variables
    Object.entries(propertyVariables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    });
    
    // Replace sender variables
    result = result.replace(/\[Your Name\]/g, senderInfo.name || '[Your Name]');
    result = result.replace(/\[Your Company\]/g, senderInfo.company || '[Your Company]');
    result = result.replace(/\[Your Phone\]/g, senderInfo.phone || '[Your Phone]');
    result = result.replace(/\[Your Email\]/g, senderInfo.email || '[Your Email]');
    
    // Remove conditional blocks for missing values
    result = result.replace(/\{\{#if \w+\}\}.*?\{\{\/if\}\}/gs, '');
    
    return result;
  };

  // Update edited content when template changes
  useEffect(() => {
    if (property && selectedTemplate) {
      const template = LETTER_TEMPLATES[selectedTemplate];
      setEditedSubject(replaceVariables(template.subject));
      setEditedBody(replaceVariables(template.body));
    }
  }, [selectedTemplate, property, propertyVariables]);

  const handleCopy = () => {
    const fullLetter = `Subject: ${editedSubject}\n\n${editedBody}`;
    navigator.clipboard.writeText(fullLetter);
    toast.success('Letter copied to clipboard');
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${editedSubject}</title>
          <style>
            body {
              font-family: 'Times New Roman', serif;
              font-size: 12pt;
              line-height: 1.6;
              max-width: 8.5in;
              margin: 1in auto;
              padding: 0 0.5in;
            }
            .date { margin-bottom: 1em; }
            .recipient { margin-bottom: 1.5em; }
            .subject { font-weight: bold; margin-bottom: 1.5em; }
            .body { white-space: pre-wrap; }
            @media print {
              body { margin: 0; padding: 1in; }
            }
          </style>
        </head>
        <body>
          <div class="date">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          <div class="recipient">
            ${propertyVariables.owner_name}<br>
            ${propertyVariables.mailing_address?.replace(/\n/g, '<br>')}
          </div>
          <div class="subject">Re: ${editedSubject}</div>
          <div class="body">${editedBody}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownload = () => {
    const content = `Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

To:
${propertyVariables.owner_name}
${propertyVariables.mailing_address}

Subject: ${editedSubject}

${editedBody}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Letter_${property?.folio_number || 'property'}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Letter downloaded');
  };

  if (!property) return null;

  const currentTemplate = LETTER_TEMPLATES[selectedTemplate];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                Compose Letter
              </DialogTitle>
              <p className="text-sm text-slate-500 mt-0.5">
                {propertyVariables.address} • {propertyVariables.owner_name}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex h-[calc(90vh-180px)]">
          {/* Left Panel - Template Selection */}
          <div className="w-80 border-r bg-slate-50/50 flex flex-col overflow-hidden">
            {/* Templates Section */}
            <div className="p-4 pb-2">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Letter Templates
              </h3>
            </div>
            
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-2 pb-4">
                {Object.entries(LETTER_TEMPLATES).map(([key, template]) => (
                  <Card 
                    key={key}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTemplate === key 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:bg-white'
                    }`}
                    onClick={() => setSelectedTemplate(key)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <span className="text-xl">{template.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-slate-800">
                            {template.name}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {template.description}
                          </p>
                        </div>
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

          {/* Right Panel - Letter Editor/Preview */}
          <div className="flex-1 flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 border-b bg-white">
              <div className="flex items-center gap-2">
                <Badge className={`bg-${currentTemplate.color}-100 text-${currentTemplate.color}-700`}>
                  {currentTemplate.icon} {currentTemplate.name}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={isPreview ? "outline" : "default"}
                  onClick={() => setIsPreview(false)}
                  className="h-8"
                >
                  <Edit3 className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant={isPreview ? "default" : "outline"}
                  onClick={() => setIsPreview(true)}
                  className="h-8"
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  Preview
                </Button>
              </div>
            </div>

            {/* Content Area */}
            <ScrollArea className="flex-1 p-4">
              {isPreview ? (
                /* Preview Mode */
                <div className="max-w-2xl mx-auto bg-white border rounded-lg shadow-sm p-8 font-serif">
                  <div className="text-sm text-slate-500 mb-6">
                    {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  
                  <div className="mb-6 text-sm">
                    <p className="font-medium">{propertyVariables.owner_name}</p>
                    {propertyVariables.mailing_address?.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>

                  <div className="font-bold mb-6">
                    Re: {editedSubject}
                  </div>

                  <div className="whitespace-pre-wrap leading-relaxed text-slate-800">
                    {editedBody}
                  </div>
                </div>
              ) : (
                /* Edit Mode */
                <div className="space-y-4 max-w-3xl">
                  {/* Recipient Info (Read Only) */}
                  <div className="p-4 bg-slate-50 rounded-lg border">
                    <Label className="text-xs text-slate-500 uppercase tracking-wider">Recipient</Label>
                    <div className="mt-2 text-sm">
                      <p className="font-medium text-slate-800">{propertyVariables.owner_name}</p>
                      {propertyVariables.mailing_address?.split('\n').map((line, i) => (
                        <p key={i} className="text-slate-600">{line}</p>
                      ))}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <Label className="text-xs text-slate-500 uppercase tracking-wider">Subject Line</Label>
                    <Input
                      value={editedSubject}
                      onChange={(e) => setEditedSubject(e.target.value)}
                      className="mt-2 font-medium"
                    />
                  </div>

                  {/* Body */}
                  <div>
                    <Label className="text-xs text-slate-500 uppercase tracking-wider">Letter Body</Label>
                    <Textarea
                      value={editedBody}
                      onChange={(e) => setEditedBody(e.target.value)}
                      className="mt-2 min-h-[400px] font-mono text-sm leading-relaxed"
                    />
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-4 border-t bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button onClick={handlePrint} className="bg-gradient-to-r from-blue-600 to-indigo-600">
              <Printer className="h-4 w-4 mr-2" />
              Print Letter
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

