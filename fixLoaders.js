const fs = require('fs');

function applyToCaseDetail() {
  const file = 'client/src/pages/lawyer/CaseDetail.jsx';
  let content = fs.readFileSync(file, 'utf8');

  if (!content.includes('import SkeletonLoader')) {
    content = content.replace(
      "import {\n  Clock,",
      "import SkeletonLoader from '../../components/ui/SkeletonLoader';\nimport {\n  Clock,"
    );
  }

  // Documents Tab
  if (!content.includes('const documentStatus')) {
    content = content.replace(
      'function DocumentsTab({ visibleDocs, toggleShared, softDelete }) {',
      'function DocumentsTab({ visibleDocs, toggleShared, softDelete }) {\n  const documentStatus = useSelector(state => state.document?.status || \'succeeded\');'
    );
  }
  
  content = content.replace(
    '<div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">\n        {visibleDocs.length === 0 ? (',
    '<div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">\n        {documentStatus === \'loading\' ? <SkeletonLoader variant="table" /> : visibleDocs.length === 0 ? ('
  );

  // Expenses Tab (Metrics)
  content = content.replace(
    '<div className="grid grid-cols-1 md:grid-cols-3 gap-5">',
    '{expenseStatus === \'loading\' ? <SkeletonLoader variant="stat-cards" /> : <div className="grid grid-cols-1 md:grid-cols-3 gap-5">'
  );
  // Close the ternary for metrics - wait, the grid div has a closing tag. 
  // The structure is: 
  // <div className="grid ...">
  //   <motion.div ... />
  //   <motion.div ... />
  //   <motion.div ... />
  // </div>
  // Let's replace the closing div
  content = content.replace(
    '</p>\n        </motion.div>\n      </div>',
    '</p>\n        </motion.div>\n      </div>}'
  );

  // Expenses Tab (Ledger / Invoice table)
  // Look for the Ledger table section
  content = content.replace(
    '        {expenses.length === 0 ? (',
    '        {expenseStatus === \'loading\' ? <SkeletonLoader variant="table" /> : expenses.length === 0 ? ('
  );
  
  content = content.replace(
    '        {invoices.length === 0 ? (',
    '        {invoiceStatus === \'loading\' ? <SkeletonLoader variant="table" /> : invoices.length === 0 ? ('
  );

  fs.writeFileSync(file, content);
  console.log('CaseDetail updated');
}

function applyToCalendar() {
  const file = 'client/src/pages/lawyer/CalendarWorkspace.jsx';
  let content = fs.readFileSync(file, 'utf8');

  if (!content.includes('import SkeletonLoader')) {
    content = content.replace(
      "import { Select, SelectTrigger",
      "import SkeletonLoader from '../../components/ui/SkeletonLoader';\nimport { Select, SelectTrigger"
    );
  }

  // Calendar
  content = content.replace(
    "        {status === 'loading' ? (\n          <div className=\"grid grid-cols-7 gap-1\">\n            {Array.from({ length: 42 }).map((_, i) => (\n              <div key={i} className=\"min-h-[80px] bg-gray-100 animate-pulse rounded-md\"></div>\n            ))}\n          </div>\n        ) : (",
    "        {status === 'loading' ? (\n          <SkeletonLoader variant=\"calendar\" />\n        ) : ("
  );

  // Upcoming
  content = content.replace(
    "        {status === 'loading' ? (\n          <div className=\"flex-1 flex items-center justify-center\">\n            <Loader2 className=\"animate-spin text-[#94A3B8]\" size={24} />\n          </div>\n        ) : upcomingAppointments.length === 0 ? (",
    "        {status === 'loading' ? (\n          <SkeletonLoader variant=\"list\" />\n        ) : upcomingAppointments.length === 0 ? ("
  );

  fs.writeFileSync(file, content);
  console.log('CalendarWorkspace updated');
}

applyToCaseDetail();
applyToCalendar();
