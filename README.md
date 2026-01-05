# PrimeBroward CRM

A **Wholesale Real Estate CRM** designed specifically for Broward County, Florida. Built with Python (FastAPI) backend and React frontend.

## Features

### 📊 Property Database
- Import BCPA tax roll data (CSV) containing owner information, property details, assessed values, and sales history
- Efficiently handles large datasets (tested with 600MB+ CSV files)
- Smart column name matching for various CSV formats

### 📈 Lead Management
- Convert properties into leads with configurable status tracking
- Status workflow: New → Skip Trace → Contacted → Offer Made → Under Contract → Sold
- Track follow-up dates and assigned team members

### 🧮 Smart Calculations
- Automatically calculate estimated purchase prices using documentary stamps
- Florida doc stamp rate: $0.70 per $100
- Identify potential equity (Just Value - Estimated Purchase Price)
- Flag absentee owners automatically

### 🔍 Advanced Filtering
- Search by owner name, folio number, or property address
- Filter by location, property type, assessed values
- Filter by lead status, follow-up dates, homestead status
- Filter by absentee owner status

### ✉️ Letter Generation
- Create custom letter templates with variable substitution
- Generate PDF or DOCX letters for individual properties
- Bulk letter generation for multiple properties
- Pre-built templates: Initial Offer, Follow-Up, Absentee Owner, High Equity

### 📥 Import/Export
- Import CSV files via file upload or local file path
- Export filtered data to CSV for mailing or reporting
- Progress tracking for large imports

---

## Quick Start

### Prerequisites

- **Python 3.10+** - [Download](https://python.org)
- **Node.js 18+** - [Download](https://nodejs.org)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/PrimeBrowardCRM.git
   cd PrimeBrowardCRM
   ```

2. **Install Python dependencies**
   ```bash
   cd server
   pip install -r requirements.txt
   cd ..
   ```

3. **Install Node.js dependencies**
   ```bash
   npm install
   ```

### Running the Application

#### Option 1: Use the startup script (Windows)
```powershell
.\start.ps1
```

#### Option 2: Start manually

**Terminal 1 - Start the Python API:**
```bash
cd server
python run.py
```

**Terminal 2 - Start the React frontend:**
```bash
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:5173
- **API Docs**: http://127.0.0.1:8000/docs
- **API Health**: http://127.0.0.1:8000/api/health

---

## Importing Your CSV Data

### Method 1: Via File Path (Recommended for large files)

1. Place your CSV file anywhere on your computer
2. Open the app and click "Import/Export"
3. Enter the full file path (e.g., `C:\Data\bcpa_tax_roll.csv`)
4. Click "Import from Path"

### Method 2: Via File Upload (For files under 100MB)

1. Open the app and click "Import/Export"
2. Switch to "Upload File" tab
3. Click to select your CSV file
4. Click "Start Import"

### Expected CSV Columns

The importer is flexible and will match common column name variations:

| Required | Column Names Accepted |
|----------|----------------------|
| ✓ | `folio_number`, `folionumber`, `folio`, `parcel_id` |

| Optional | Column Names Accepted |
|----------|----------------------|
| Owner | `name_line_1`, `owner_name`, `name_line_2` |
| Mailing | `mailing_address_line_1`, `city`, `state`, `zip` |
| Situs | `situs_street_number`, `situs_street_name`, `situs_city` |
| Property | `use_type`, `bldg_year_built`, `beds`, `baths` |
| Values | `just_value`, `just_land_value`, `just_building_value` |
| Sale | `sale_date_1`, `deed_type_1`, `stamp_amount_1` |

---

## Project Structure

```
PrimeBrowardCRM/
├── server/                 # Python FastAPI backend
│   ├── app/
│   │   ├── models/         # SQLAlchemy models
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── config.py       # Configuration
│   │   └── main.py         # FastAPI app
│   ├── requirements.txt
│   └── run.py              # Startup script
│
├── src/                    # React frontend
│   ├── api/                # API client
│   ├── components/         # React components
│   ├── pages/              # Page components
│   └── main.jsx            # App entry point
│
├── data/                   # Application data (created at runtime)
│   ├── primebroward.db     # SQLite database
│   ├── letters/            # Generated letters
│   └── exports/            # Exported CSV files
│
├── package.json            # Node.js dependencies
├── start.ps1               # PowerShell startup script
└── README.md
```

---

## API Endpoints

### Properties
- `GET /api/properties` - List properties with filters
- `GET /api/properties/{folio}` - Get single property
- `GET /api/properties/stats` - Get statistics
- `GET /api/properties/cities` - Get unique cities
- `GET /api/properties/use-types` - Get unique use types

### Leads
- `GET /api/leads` - List leads
- `POST /api/leads` - Create lead
- `PUT /api/leads/{id}` - Update lead
- `DELETE /api/leads/{id}` - Delete lead

### Letters
- `GET /api/letters/templates` - List templates
- `POST /api/letters/templates` - Create template
- `POST /api/letters/generate` - Generate single letter
- `POST /api/letters/generate-bulk` - Generate bulk letters

### Import/Export
- `POST /api/import-export/import` - Import CSV (upload)
- `POST /api/import-export/import-from-path` - Import CSV (file path)
- `GET /api/import-export/export` - Export to CSV

---

## Technology Stack

### Backend
- **Python 3.10+**
- **FastAPI** - Modern async web framework
- **SQLAlchemy** - ORM for SQLite
- **Pandas** - CSV processing
- **ReportLab** - PDF generation
- **python-docx** - DOCX generation

### Frontend
- **React 18**
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Radix UI / shadcn/ui** - Components
- **React Query** - Data fetching
- **Framer Motion** - Animations

### Database
- **SQLite** - Local file-based database
- WAL mode enabled for performance

---

## License

Private - Internal use only.

---

## Support

For questions or issues, please contact the development team.
