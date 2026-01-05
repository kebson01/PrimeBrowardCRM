import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, FileSpreadsheet, Check, AlertTriangle, Loader2, FolderOpen } from "lucide-react";
import { importExport } from '@/api/apiClient';

export default function ImportExport({ 
  isOpen, 
  onClose, 
  onImportComplete,
  properties,
  totalCount,
  user
}) {
  const [mode, setMode] = useState('select');
  const [file, setFile] = useState(null);
  const [filePath, setFilePath] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [importedCount, setImportedCount] = useState(0);
  const [updatedCount, setUpdatedCount] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [validationErrors, setValidationErrors] = useState([]);
  const fileInputRef = useRef(null);

  const isAdmin = user?.role === 'admin';

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
        setError('Please select a CSV file (.csv)');
        return;
      }
      if (selectedFile.size > 1024 * 1024 * 1024) { // 1GB limit
        setError('File is too large (max 1GB)');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleImportFromPath = async () => {
    if (!filePath.trim()) {
      setError('Please enter a file path');
      return;
    }

    setMode('importing');
    setProgress(10);
    setError('');
    setValidationErrors([]);

    try {
      const result = await importExport.importFromPath(filePath.trim());
      
      setImportedCount(result.imported || 0);
      setUpdatedCount(result.updated || 0);
      setTotalRows(result.total_rows || 0);
      setProgress(100);
      
      if (result.error_count > 0) {
        setMode('success-with-errors');
      } else {
        setMode('success');
      }
      
      onImportComplete();
    } catch (err) {
      console.error('Import error:', err);
      setError(err.message || 'Import failed');
      setMode('error');
    }
  };

  const handleImportFile = async () => {
    if (!file) return;

    setMode('importing');
    setProgress(10);
    setError('');
    setValidationErrors([]);

    try {
      setProgress(30);
      const result = await importExport.importCSV(file);
      
      setImportedCount(result.imported || 0);
      setUpdatedCount(result.updated || 0);
      setTotalRows(result.total_rows || 0);
      setValidationErrors(result.errors || []);
      setProgress(100);
      
      if (result.error_count > 0) {
        setMode('success-with-errors');
      } else {
        setMode('success');
      }
      
      onImportComplete();
    } catch (err) {
      console.error('Import error:', err);
      setError(err.message || 'Import failed');
      setMode('error');
    }
  };

  const downloadErrorReport = () => {
    if (validationErrors.length === 0) return;

    const csvContent = [
      'Row,Folio Number,Error',
      ...validationErrors.map(err => 
        `${err.row},"${err.folio || 'N/A'}","${err.error}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `import_errors_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    try {
      await importExport.exportCSV();
      onClose();
    } catch (err) {
      setError(err.message || 'Export failed');
    }
  };

  const resetModal = () => {
    setMode('select');
    setFile(null);
    setFilePath('');
    setProgress(0);
    setError('');
    setImportedCount(0);
    setUpdatedCount(0);
    setTotalRows(0);
    setValidationErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-blue-600" />
            Import / Export Property Data
          </DialogTitle>
          <DialogDescription>
            {mode === 'select' && 'Import BCPA tax roll data from CSV or export current data.'}
            {mode === 'importing' && 'Processing BCPA tax roll data...'}
            {mode === 'success' && 'Import completed successfully!'}
            {mode === 'success-with-errors' && 'Import completed with some errors.'}
            {mode === 'error' && 'There was an error with your import.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {mode === 'select' && (
            <Tabs defaultValue="path" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="path">From File Path</TabsTrigger>
                <TabsTrigger value="upload">Upload File</TabsTrigger>
              </TabsList>
              
              <TabsContent value="path" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="filePath">CSV File Path</Label>
                  <div className="flex gap-2">
                    <Input
                      id="filePath"
                      placeholder="C:\path\to\your\bcpa_data.csv"
                      value={filePath}
                      onChange={(e) => setFilePath(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Enter the full path to your CSV file on your computer.
                    This is recommended for large files (100MB+).
                  </p>
                </div>
                
                {filePath && (
                  <Button 
                    onClick={handleImportFromPath} 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={!isAdmin}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import from Path
                  </Button>
                )}
              </TabsContent>
              
              <TabsContent value="upload" className="space-y-4 mt-4">
                <div 
                  className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:border-blue-300 transition-colors cursor-pointer"
                  onClick={() => isAdmin && fileInputRef.current?.click()}
                >
                  <Upload className="h-10 w-10 mx-auto text-slate-400 mb-3" />
                  <p className="font-medium text-slate-700">
                    {isAdmin ? 'Click to select a CSV file' : 'Admin access required'}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    For files under 100MB
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {file && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                      <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">{file.name}</p>
                        <p className="text-sm text-slate-500">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
                      </div>
                    </div>
                    <Button onClick={handleImportFile} className="w-full bg-blue-600 hover:bg-blue-700">
                      <Upload className="h-4 w-4 mr-2" />
                      Start Import
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          {mode === 'select' && (
            <div className="mt-6 pt-6 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleExport}
                disabled={!properties?.length}
              >
                <Download className="h-4 w-4 mr-2" />
                Export to CSV ({(totalCount || properties?.length || 0).toLocaleString()} records)
              </Button>
            </div>
          )}

          {error && mode === 'select' && (
            <Alert className="mt-4 bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-sm text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {mode === 'importing' && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-center text-sm text-slate-600">
                Processing... This may take a few minutes for large files.
              </p>
            </div>
          )}

          {mode === 'success' && (
            <div className="text-center py-6">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-lg font-medium text-slate-800">
                Import Completed!
              </p>
              <p className="text-slate-600 mt-2">
                <span className="font-semibold text-green-600">{importedCount}</span> new properties imported
                {updatedCount > 0 && (
                  <>, <span className="font-semibold text-blue-600">{updatedCount}</span> updated</>
                )}
              </p>
            </div>
          )}

          {mode === 'success-with-errors' && (
            <div className="py-6 space-y-4">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8 text-amber-600" />
                </div>
                <p className="text-lg font-medium text-slate-800 mb-2">
                  Import Completed with Warnings
                </p>
                <p className="text-sm text-slate-600">
                  Imported <span className="font-semibold text-green-600">{importedCount}</span> new, 
                  updated <span className="font-semibold text-blue-600">{updatedCount}</span>
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  {validationErrors.length} records had issues
                </p>
              </div>

              {validationErrors.length > 0 && (
                <Button 
                  variant="outline" 
                  onClick={downloadErrorReport}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Error Report
                </Button>
              )}
            </div>
          )}

          {mode === 'error' && (
            <div className="text-center py-6">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-red-600 font-medium">Import Failed</p>
              <p className="text-sm text-slate-600 mt-2">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          {mode === 'select' && (
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
          )}
          {(mode === 'success' || mode === 'success-with-errors' || mode === 'error') && (
            <Button onClick={handleClose}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
