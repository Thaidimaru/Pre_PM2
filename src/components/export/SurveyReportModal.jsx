import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Printer, X, FileText } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import { findStationByName } from '@/lib/api';
import nbtcLogo from '@/assets/images/nbtc-logo-dashboard.png';
import forthLogo from '@/assets/images/forth-logo.png';

/**
 * SurveyReportModal - Pre-PM Survey A4 Printable Report Modal
 * Adheres strictly to official Thai government document standards (TH Sarabun New, A4).
 * Matches on-screen preview and Chrome Print preview with 1:1 pixel fidelity.
 */
export function SurveyReportModal({ isOpen, onClose, surveyData = {} }) {
  const page1Ref = useRef(null);
  const photoPageRefs = useRef([]);

  // Manage body class for zero-offset print layout and scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('survey-modal-open');
    } else {
      document.body.classList.remove('survey-modal-open');
    }
    return () => {
      document.body.classList.remove('survey-modal-open');
    };
  }, [isOpen]);

  const { isDark } = useTheme();

  if (!isOpen) return null;

  // Extract recorded survey fields (supports both flat formData and DB records with fields)
  const rawFields = surveyData.fields || {};
  const fields = { ...surveyData, ...rawFields };

  // Station info fallback from master database
  const stationName = fields.station || fields.village || fields.stationSelect || surveyData.station || 'สถานีวิทยุคมนาคม NBTC Microwave';
  const stationLookup = findStationByName(stationName);

  const province = fields.province || surveyData.province || stationLookup?.province || '';
  const district = fields.district || surveyData.district || stationLookup?.district || '';
  const subdistrict = fields.subdistrict || surveyData.subdistrict || stationLookup?.subdistrict || '';
  const installationPlace = fields.installationPlace || fields.installation_place || stationLookup?.installation_place || stationLookup?.installationPlace || '';
  const equipmentPlace = fields.equipmentPlace || fields.equipment_place || stationLookup?.equipment_place || stationLookup?.equipmentPlace || installationPlace || '-';

  // Format full location text
  const locationParts = [];
  if (installationPlace && installationPlace !== '-') {
    locationParts.push(installationPlace);
  }
  if (subdistrict) {
    const cleanSub = subdistrict.replace(/^ต\./, '').trim();
    if (cleanSub) locationParts.push(`ต.${cleanSub}`);
  }
  if (district) {
    const cleanDist = district.replace(/^อ\./, '').trim();
    if (cleanDist) locationParts.push(`อ.${cleanDist}`);
  }
  if (province) {
    const cleanProv = province.replace(/^จ\./, '').trim();
    if (cleanProv) locationParts.push(`จ.${cleanProv}`);
  }
  const locationText = locationParts.length > 0
    ? locationParts.join(' ')
    : (fields.village || fields.station || '-');

  // Visit Date & Time
  const rawDate = fields.visitDate || fields.visit_date || fields.savedAt || surveyData.savedAt;
  let visitDateStr = '-';
  if (rawDate) {
    try {
      const dateObj = typeof rawDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
        ? new Date(`${rawDate}T12:00:00`)
        : new Date(rawDate);
      if (!isNaN(dateObj.getTime())) {
        visitDateStr = dateObj.toLocaleDateString('th-TH', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      }
    } catch { }
  }
  if (visitDateStr === '-') {
    visitDateStr = new Date().toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  const rawTime = fields.visitTime || fields.visit_time;
  const visitTime = rawTime
    ? `${rawTime} น.`
    : (fields.savedAt || surveyData.savedAt
      ? new Date(fields.savedAt || surveyData.savedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'
      : '-');

  const recordId = surveyData.recordId || fields.recordId || fields.record_id || `PM-${new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 15)}`;

  // Contact Info
  const contactName = fields.contactName || fields.contact_name || stationLookup?.contact_name || fields.informantName || fields.informant_name || '-';
  const contactPosition = fields.contactPosition || fields.contact_position || stationLookup?.contact_position || 'เจ้าของพื้นที่ / ผู้ดูแลสถานี';
  const contactVillage = fields.contactVillage || fields.contact_village || (subdistrict ? `ต.${subdistrict.replace(/^ต\./, '')}` : '-');
  const contactPhone = fields.contactPhone || fields.contact_phone || fields.phone || fields.tel || '-';

  // Permission
  const permit = fields.permit || surveyData.permit || 'อนุญาต';
  const isPermitted = permit === 'อนุญาต' || permit === 'on' || permit === 'true' || permit === true;
  const accessLimit = fields.accessLimit || fields.access_limit || 'ไม่มีข้อจำกัด';

  // Equipment & Operational Assessment Fields
  const radioStatus = fields.radioStatus || fields.radio_status || 'ปกติ';
  const isRadioNormal = radioStatus === 'ปกติ';

  const receiveStatus = fields.receiveStatus || fields.receive_status || 'ปกติ';
  const isReceiveNormal = receiveStatus === 'ปกติ' || receiveStatus === 'ไม่พบ' || receiveStatus === 'ไม่พบปัญหา';

  const transmitStatus = fields.transmitStatus || fields.transmit_status || 'ปกติ';
  const isTransmitNormal = transmitStatus === 'ปกติ' || transmitStatus === 'ไม่พบ' || transmitStatus === 'ไม่พบปัญหา';

  const powerStatus = fields.powerStatus || fields.power_status || 'ปกติ';
  const isPowerNormal = powerStatus === 'ปกติ' || powerStatus === 'ไม่มี' || powerStatus === 'ไม่มีปัญหา';

  const batteryStatus = fields.batteryStatus || fields.battery_status || 'ปกติ';
  const isBatteryNormal = batteryStatus === 'ปกติ' || batteryStatus === 'ไม่มี' || batteryStatus === 'ไม่มีปัญหา';

  const groundStatus = fields.groundStatus || fields.ground_status || 'ปกติ';
  const isGroundNormal = groundStatus === 'ปกติ' || groundStatus === 'ไม่มี' || groundStatus === 'ไม่มีปัญหา' || groundStatus === 'ไม่พบ';

  const userProblem = fields.userProblem || fields.user_problem || 'ไม่พบปัญหาเพิ่มเติม';

  // Environment & Site Conditions
  const siteCondition = fields.siteCondition || fields.site_condition || 'สภาพพื้นที่ปกติ พร้อมสำหรับการปฏิบัติงาน';
  const antennaCondition = fields.antennaCondition || fields.antenna_condition || 'สภาพเสาและสายอากาศอยู่ในเกณฑ์ปกติ';
  const workObstacle = fields.workObstacle || fields.work_obstacle || 'ไม่มีอุปสรรคในการปฏิบัติงาน';

  // Summary & Signatures
  const summary = fields.summary || fields.userSummary || 'เจ้าของพื้นที่ให้ความร่วมมือในการเข้าตรวจเยี่ยมและตรวจสอบสภาพระบบอุปกรณ์เป็นอย่างดี';
  const informantName = fields.informantName || fields.informant_name || (contactName !== '-' ? contactName : '');
  const operatorName = fields.operatorName || fields.operator_name || 'วิศวกรผู้ควบคุมงาน';

  // Photo attachments
  const photos = Array.isArray(surveyData.photos) && surveyData.photos.length > 0
    ? surveyData.photos
    : (Array.isArray(fields.photos) && fields.photos.length > 0 ? fields.photos : []);

  // Split photos into chunks of 6 per appendix page
  const PHOTOS_PER_PAGE = 6;
  const photoPages = [];
  for (let i = 0; i < photos.length; i += PHOTOS_PER_PAGE) {
    photoPages.push(photos.slice(i, i + PHOTOS_PER_PAGE));
  }
  const totalPages = 1 + photoPages.length;

  // Native Print Action (triggers Chrome print dialog)
  const handlePrint = () => {
    window.print();
  };

  return createPortal(
    <div
      id="survey-report-modal-portal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-md overflow-y-auto print:p-0 print:m-0 print:bg-white print:static print:overflow-visible print:block"
    >
      {/* Modal Container */}
      <div
        className={cn(
          'relative flex max-h-[94vh] w-full max-w-5xl flex-col rounded-2xl border shadow-2xl overflow-hidden my-auto transition-colors print:max-h-none print:w-full print:border-none print:shadow-none print:rounded-none print:bg-white print:static print:overflow-visible print:m-0 print:p-0',
          isDark
            ? 'border-blue-500/30 bg-slate-900 text-slate-200'
            : 'border-slate-300 bg-white text-slate-800'
        )}
      >

        {/* Modal Action Header (Hidden in Print) */}
        <div
          className={cn(
            'flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b px-4 sm:px-6 py-3.5 no-print print:hidden transition-colors',
            isDark ? 'border-slate-800 bg-slate-950/90' : 'border-slate-200 bg-slate-50'
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors',
                isDark
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                  : 'bg-sky-100 text-sky-600 border-sky-200'
              )}
            >
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className={cn('text-sm font-bold leading-tight truncate', isDark ? 'text-white' : 'text-slate-900')}>
                แบบรายงานการตรวจเยี่ยมเจ้าของพื้นที่ Pre-PM (A4 Official Report)
              </h3>
              <p className={cn('text-xs truncate', isDark ? 'text-slate-400' : 'text-slate-500')}>
                สถานี: <span className={cn('font-semibold', isDark ? 'text-cyan-300' : 'text-sky-700')}>{stationName}</span> | รหัส: <span className={cn('font-mono font-semibold', isDark ? 'text-cyan-400' : 'text-sky-600')}>{recordId}</span> | หน้าทั้งหมด: <span className={cn('font-semibold', isDark ? 'text-white' : 'text-slate-900')}>{totalPages} หน้า</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 self-end sm:self-auto shrink-0">
            {/* Button 1: Print Document */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-3.5 sm:px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-cyan-400 transition-all duration-200 cursor-pointer"
              title="พิมพ์เอกสารออกเครื่องพิมพ์ หรือบันทึกเป็น PDF ผ่านคำสั่งพิมพ์ของระบบ (Ctrl+P)"
            >
              <Printer className="h-4 w-4" />
              <span>พิมพ์เอกสาร (Print)</span>
            </button>

            {/* Close Modal Button */}
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-xl border transition-colors cursor-pointer ml-1',
                isDark
                  ? 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                  : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              )}
              title="ปิดหน้าต่าง"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable A4 Preview Container */}
        <div
          className={cn(
            'flex-1 overflow-x-auto overflow-y-auto p-3 sm:p-5 md:p-6 flex flex-col items-center gap-6 transition-colors print:p-0 print:bg-white print:overflow-visible print:block',
            isDark ? 'bg-slate-950/70' : 'bg-slate-200/80'
          )}
        >

          <div id="printable-report-area" className="flex flex-col items-center gap-6 w-full print:block print:w-full print:m-0 print:p-0">

            {/* ========================================================================= */}
            {/* PAGE 1: Official Survey Report & Signatures */}
            {/* ========================================================================= */}
            <div
              id="printable-page-1"
              ref={page1Ref}
              className="a4-sheet font-sarabun text-black bg-white shadow-2xl border border-slate-300 rounded-sm w-[210mm] min-h-[297mm] h-[297mm] mx-auto text-[13px] leading-tight relative box-border flex flex-col justify-between print:m-0 print:border-none print:shadow-none"
              style={{
                fontFamily: "'Sarabun', 'Noto Sans Thai', 'Inter', system-ui, sans-serif",
                color: '#000000',
                backgroundColor: '#ffffff',
                padding: '8mm 12mm 8mm 12mm'
              }}
            >
              <div>
                {/* 1. Header with Logos & Project Title */}
                <div className="flex items-center justify-between pb-1.5 border-b-2 border-black mb-1.5">
                  {/* Left Logo - NBTC */}
                  <div className="w-32 shrink-0 flex items-center justify-start">
                    <img
                      src={nbtcLogo}
                      alt="NBTC Logo"
                      style={{ height: '72px', width: 'auto' }}
                      className="object-contain"
                      onError={(e) => {
                        e.currentTarget.src = '/nbtc-logo-dashboard.png';
                      }}
                    />
                  </div>

                  {/* Center Title - NBTC Microwave Project Title */}
                  <div className="flex-1 min-w-0 text-center px-1 space-y-0.5">
                    <h1 className="text-[16px] font-bold leading-tight tracking-normal whitespace-nowrap text-black">
                      การจัดซื้ออุปกรณ์พร้อมดำเนินการติดตั้ง
                    </h1>
                    <h2 className="text-[14.5px] font-bold leading-tight tracking-normal whitespace-nowrap text-neutral-900">
                      โครงการเพิ่มประสิทธิภาพระบบโครงข่ายสื่อสารด้วยอุปกรณ์ทวนสัญญาณผ่านคลื่นความถี่สูง (SHF)
                    </h2>
                    <h3 className="text-[13.5px] font-bold leading-tight tracking-normal whitespace-nowrap text-neutral-800">
                      เพื่อสนับสนุนการปฏิบัติราชการและแก้ไขปัญหาให้กับประชาชนในพื้นที่ห่างไกล
                    </h3>
                    <h4 className="text-[13px] font-bold leading-tight tracking-normal whitespace-nowrap text-neutral-700">
                      สัญญาเลขที่ ๘๖๘๐๒๒๘ ลงวันที่ ๒๓ กรกฎาคม ๒๕๖๘
                    </h4>
                  </div>

                  {/* Right Logo - FORTH */}
                  <div className="w-32 shrink-0 flex items-center justify-end">
                    <img
                      src={forthLogo}
                      alt="FORTH Logo"
                      style={{ height: '24px', width: 'auto' }}
                      className="object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>

                {/* Document Meta Subheader */}
                <div className="flex justify-between items-center text-[12.5px] pb-1 text-neutral-900 font-medium">
                  <div>
                    <span className="font-bold">รหัสรายการสำรวจ: </span>
                    <span className="font-mono font-bold text-black">{recordId}</span>
                  </div>
                  <div>
                    <span className="font-bold">วันที่บันทึกตรวจเยี่ยม: </span>
                    <span>{visitDateStr}</span>
                    {visitTime !== '-' && <span className="ml-1.5 font-semibold">({visitTime})</span>}
                  </div>
                </div>

                {/* Section 1: ข้อมูลสถานีและสถานที่ติดตั้ง */}
                <div className="mb-1.5">
                  <div className="bg-neutral-100 font-bold border border-black px-2.5 py-0.5 text-[13px] text-black">
                    1. ข้อมูลสถานีและสถานที่ติดตั้ง (Station & Location Details)
                  </div>
                  <table className="w-full border-collapse border border-t-0 border-black text-[12.5px] leading-[1.3]">
                    <tbody>
                      <tr>
                        <td className="border border-black py-1 px-3 w-[18%] font-bold bg-neutral-50/80">
                          ชื่อสถานี
                        </td>
                        <td className="border border-black py-1 px-3 w-[32%] font-semibold text-black">
                          {stationName}
                        </td>
                        <td className="border border-black py-1 px-3 w-[20%] font-bold bg-neutral-50/80">
                          สถานที่วางเครื่อง
                        </td>
                        <td className="border border-black py-1 px-3 w-[30%] text-black">
                          {equipmentPlace}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black py-1 px-3 font-bold bg-neutral-50/80">
                          สถานที่ติดตั้ง
                        </td>
                        <td className="border border-black py-1 px-3 text-black">
                          {installationPlace || locationText || '-'}
                        </td>
                        <td className="border border-black py-1 px-3 font-bold bg-neutral-50/80">
                          ตำบล / อำเภอ / จังหวัด
                        </td>
                        <td className="border border-black py-1 px-3 text-black">
                          {[
                            subdistrict ? (subdistrict.startsWith('ต.') ? subdistrict : `ต.${subdistrict}`) : '',
                            district ? (district.startsWith('อ.') ? district : `อ.${district}`) : '',
                            province ? (province.startsWith('จ.') ? province : `จ.${province}`) : ''
                          ].filter(Boolean).join(' ') || '-'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Section 2: ข้อมูลเจ้าของพื้นที่และการขออนุญาต */}
                <div className="mb-2">
                  <div className="bg-neutral-100 font-bold border border-black px-2.5 py-1 text-[13.5px] text-black">
                    2. ข้อมูลผู้ให้ข้อมูล / เจ้าของพื้นที่ และการขออนุญาตเข้าพื้นที่ (Site Owner & Access Permission)
                  </div>
                  <table className="w-full border-collapse border border-t-0 border-black text-[13px] leading-[1.3]">
                    <tbody>
                      <tr>
                        <td className="border border-black py-1 px-3 w-[18%] font-bold bg-neutral-50/80">
                          ชื่อ - สกุล
                        </td>
                        <td className="border border-black py-1 px-3 w-[32%] font-semibold text-black">
                          {contactName}
                        </td>
                        <td className="border border-black py-1 px-3 w-[20%] font-bold bg-neutral-50/80">
                          ตำแหน่ง
                        </td>
                        <td className="border border-black py-1 px-3 w-[30%] text-black">
                          {contactPosition}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black py-1 px-3 font-bold bg-neutral-50/80">
                          หน่วยงาน / หมู่บ้าน
                        </td>
                        <td className="border border-black py-1 px-3 text-black">
                          {contactVillage}
                        </td>
                        <td className="border border-black py-1 px-3 font-bold bg-neutral-50/80">
                          เบอร์โทรศัพท์
                        </td>
                        <td className="border border-black py-1 px-3 font-mono text-black">
                          {contactPhone}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black py-1 px-3 font-bold bg-neutral-50/80">
                          ผลการขออนุญาต
                        </td>
                        <td className="border border-black py-1 px-3">
                          <span className={`inline-flex items-center font-bold px-2 py-0.5 rounded text-[12px] ${isPermitted ? 'bg-emerald-50 text-emerald-900 border border-emerald-500' : 'bg-rose-50 text-rose-900 border border-rose-500'
                            }`}>
                            {isPermitted ? 'อนุญาตให้เข้าพื้นที่' : 'ไม่อนุญาตให้เข้าพื้นที่'}
                          </span>
                        </td>
                        <td className="border border-black py-1 px-3 font-bold bg-neutral-50/80">
                          ข้อจำกัดในการเข้าพื้นที่
                        </td>
                        <td className="border border-black py-1 px-3 text-black">
                          {accessLimit}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Section 3: ผลการตรวจสอบและประเมินสภาพระบบอุปกรณ์ */}
                <div className="mb-2">
                  <div className="bg-neutral-100 font-bold border border-black px-2.5 py-1 text-[13.5px] text-black">
                    3. บันทึกผลการตรวจสอบและประเมินสภาพระบบอุปกรณ์ (Equipment & Operational Assessment)
                  </div>
                  <table className="w-full border-collapse border border-t-0 border-black text-[13px] leading-[1.3]">
                    <thead>
                      <tr className="bg-neutral-100 font-bold border-b border-black text-center text-black">
                        <th className="border border-black py-1 px-1.5 w-[7%]">ลำดับ</th>
                        <th className="border border-black py-1 px-3 text-left w-[43%]">รายการตรวจประเมิน</th>
                        <th className="border border-black py-1 px-2 w-[20%]">ผลการตรวจ</th>
                        <th className="border border-black py-1 px-3 text-left w-[30%]">รายละเอียด / ข้อสังเกต</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Item 1 */}
                      <tr>
                        <td className="border border-black py-1 px-1.5 text-center">1</td>
                        <td className="border border-black py-1 px-3">
                          สภาพการทำงานของเครื่องวิทยุคมนาคม
                        </td>
                        <td className="border border-black py-1 px-2 text-center font-semibold">
                          {isRadioNormal ? (
                            <span className="text-emerald-800 font-bold">ปกติ</span>
                          ) : (
                            <span className="text-rose-700 font-bold">ไม่ปกติ ({radioStatus})</span>
                          )}
                        </td>
                        <td className="border border-black py-1 px-3 text-neutral-800">
                          {isRadioNormal ? 'เครื่องวิทยุทำงานปกติ' : 'พบข้อขัดข้องในการใช้งาน'}
                        </td>
                      </tr>

                      {/* Item 2 */}
                      <tr>
                        <td className="border border-black py-1 px-1.5 text-center">2</td>
                        <td className="border border-black py-1 px-3">
                          ภาครับสัญญาณ (Receiver Status)
                        </td>
                        <td className="border border-black py-1 px-2 text-center font-semibold">
                          {isReceiveNormal ? (
                            <span className="text-emerald-800 font-bold">ไม่พบปัญหา</span>
                          ) : (
                            <span className="text-rose-700 font-bold">พบปัญหา ({receiveStatus})</span>
                          )}
                        </td>
                        <td className="border border-black py-1 px-3 text-neutral-800">
                          {isReceiveNormal ? 'รับสัญญาณได้ชัดเจน' : 'สัญญาณขาดหาย/มีสัญญาณรบกวน'}
                        </td>
                      </tr>

                      {/* Item 3 */}
                      <tr>
                        <td className="border border-black py-1 px-1.5 text-center">3</td>
                        <td className="border border-black py-1 px-3">
                          ภาคส่งสัญญาณ (Transmitter Status)
                        </td>
                        <td className="border border-black py-1 px-2 text-center font-semibold">
                          {isTransmitNormal ? (
                            <span className="text-emerald-800 font-bold">ไม่พบปัญหา</span>
                          ) : (
                            <span className="text-rose-700 font-bold">พบปัญหา ({transmitStatus})</span>
                          )}
                        </td>
                        <td className="border border-black py-1 px-3 text-neutral-800">
                          {isTransmitNormal ? 'ส่งสัญญาณออกอากาศได้ตามปกติ' : 'กำลังส่งตก/ส่งสัญญาณไม่ได้'}
                        </td>
                      </tr>

                      {/* Item 4 */}
                      <tr>
                        <td className="border border-black py-1 px-1.5 text-center">4</td>
                        <td className="border border-black py-1 px-3">
                          ระบบไฟฟ้าหลักของสถานี (Power Supply)
                        </td>
                        <td className="border border-black py-1 px-2 text-center font-semibold">
                          {isPowerNormal ? (
                            <span className="text-emerald-800 font-bold">ไม่มีปัญหา</span>
                          ) : (
                            <span className="text-rose-700 font-bold">มีปัญหา ({powerStatus})</span>
                          )}
                        </td>
                        <td className="border border-black py-1 px-3 text-neutral-800">
                          {isPowerNormal ? 'ระบบไฟฟ้าจ่ายไฟสม่ำเสมอ' : 'ระบบไฟฟ้าขัดข้อง/ไฟตกบ่อย'}
                        </td>
                      </tr>

                      {/* Item 5 */}
                      <tr>
                        <td className="border border-black py-1 px-1.5 text-center">5</td>
                        <td className="border border-black py-1 px-3">
                          แบตเตอรี่สำรอง (Backup Battery)
                        </td>
                        <td className="border border-black py-1 px-2 text-center font-semibold">
                          {isBatteryNormal ? (
                            <span className="text-emerald-800 font-bold">ไม่มีปัญหา</span>
                          ) : (
                            <span className="text-rose-700 font-bold">มีปัญหา ({batteryStatus})</span>
                          )}
                        </td>
                        <td className="border border-black py-1 px-3 text-neutral-800">
                          {isBatteryNormal ? 'แบตเตอรี่สำรองพร้อมจ่ายไฟ' : 'แบตเตอรี่เสื่อม/เก็บไฟไม่อยู่'}
                        </td>
                      </tr>

                      {/* Item 6 */}
                      <tr>
                        <td className="border border-black py-1 px-1.5 text-center">6</td>
                        <td className="border border-black py-1 px-3">
                          ระบบกราวด์ ( Ground System )
                        </td>
                        <td className="border border-black py-1 px-2 text-center font-semibold">
                          {isGroundNormal ? (
                            <span className="text-emerald-800 font-bold">ปกติ</span>
                          ) : (
                            <span className="text-rose-700 font-bold">ไม่ปกติ ({groundStatus})</span>
                          )}
                        </td>
                        <td className="border border-black py-1 px-3 text-neutral-800">
                          {isGroundNormal ? 'ระบบกราวด์สมบูรณ์ ต่อลงดินเรียบร้อย' : 'ระบบกราวด์มีปัญหา/หลุดหลวม'}
                        </td>
                      </tr>

                      {/* Additional Problems */}
                      <tr>
                        <td className="border border-black py-1 px-3 text-center font-bold bg-neutral-50/80 text-neutral-900" colSpan={2}>
                          ปัญหาเพิ่มเติมที่ผู้ใช้งานแจ้ง
                        </td>
                        <td className="border border-black py-1 px-3 text-neutral-900" colSpan={2}>
                          {userProblem}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Section 4: สภาพแวดล้อมหน้างานและสิ่งกีดขวาง */}
                <div className="mb-2">
                  <div className="bg-neutral-100 font-bold border border-black px-2.5 py-1 text-[13.5px] text-black">
                    4. สภาพแวดล้อมหน้างานและอาคารสถานที่ (Site Environmental & Physical Conditions)
                  </div>
                  <table className="w-full border-collapse border border-t-0 border-black text-[13px] leading-[1.3]">
                    <tbody>
                      <tr>
                        <td className="border border-black py-1 px-3 w-[35%] font-bold bg-neutral-50/80">
                          สภาพพื้นที่ติดตั้งอุปกรณ์
                        </td>
                        <td className="border border-black py-1 px-3 w-[65%] text-black">
                          {siteCondition}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black py-1 px-3 font-bold bg-neutral-50/80">
                          สภาพเสาอากาศและสายอากาศ (มองเห็นจากพื้น)
                        </td>
                        <td className="border border-black py-1 px-3 text-black">
                          {antennaCondition}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black py-1 px-3 font-bold bg-neutral-50/80">
                          อุปสรรคและข้อจำกัดในการปฏิบัติงาน
                        </td>
                        <td className="border border-black py-1 px-3 text-black">
                          {workObstacle}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Section 5: สรุปผลการตรวจเยี่ยม */}
                <div className="mb-2">
                  <div className="bg-neutral-100 font-bold border border-black px-2.5 py-1 text-[13.5px] text-black">
                    5. สรุปผลการตรวจเยี่ยมและข้อคิดเห็น (Survey Summary & Recommendations)
                  </div>
                  <div className="border border-t-0 border-black p-2.5 text-[13px] leading-relaxed min-h-[55px] bg-white text-black">
                    {summary}
                  </div>
                </div>
              </div>

              {/* Footer for Page 1 */}
              <div className="pt-1.5 mt-1 border-t border-black/30 flex justify-between items-center text-[11px] text-neutral-600">
                <span>โครงการบำรุงรักษาเชิงป้องกันล่วงหน้า (Pre-Preventive Maintenance: Pre-PM) — {stationName}</span>
                <span>หน้า 1 จาก {totalPages}</span>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* PAGE 2+: Photo Documentation Appendix (Rendered if photos exist) */}
            {/* ========================================================================= */}
            {photoPages.map((pagePhotos, pageIndex) => (
              <div
                key={pageIndex}
                id={`printable-photo-page-${pageIndex}`}
                ref={(el) => (photoPageRefs.current[pageIndex] = el)}
                className="a4-sheet font-sarabun text-black bg-white shadow-2xl border border-slate-300 rounded-sm w-[210mm] min-h-[297mm] h-[297mm] mx-auto text-[13px] leading-tight relative box-border flex flex-col justify-between print:m-0 print:border-none print:shadow-none"
                style={{
                  fontFamily: "'Sarabun', 'Noto Sans Thai', 'Inter', system-ui, sans-serif",
                  color: '#000000',
                  backgroundColor: '#ffffff',
                  padding: '12mm 15mm 12mm 15mm'
                }}
              >
                <div>
                  {/* Header for Appendix */}
                  <div className="flex items-center justify-between pb-2 border-b-2 border-black mb-3">
                    <div className="w-32 shrink-0 flex items-center justify-start">
                      <img
                        src={nbtcLogo}
                        alt="NBTC Logo"
                        style={{ height: '72px', width: 'auto' }}
                        className="object-contain"
                        onError={(e) => {
                          e.currentTarget.src = '/nbtc-logo-dashboard.png';
                        }}
                      />
                    </div>
                    <div className="flex-1 text-center px-1 space-y-0.5">
                      <h2 className="text-[15px] font-bold leading-tight text-black">
                        ภาคผนวก: ภาพถ่ายจากการเข้าตรวจเยี่ยมหน้างาน (Field Visit Documentation)
                      </h2>
                      <p className="text-[12.5px] text-neutral-800">
                        สถานี: <span className="font-bold text-black">{stationName}</span> | รหัสรายการ: <span className="font-mono font-bold">{recordId}</span> | วันที่: {visitDateStr}
                      </p>
                    </div>
                    <div className="w-32 shrink-0 flex items-center justify-end">
                      <img
                        src={forthLogo}
                        alt="FORTH Logo"
                        style={{ height: '24px', width: 'auto' }}
                        className="object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>

                  {/* Grid of photos (max 6 per page: 2 columns x 3 rows) */}
                  <div className="grid grid-cols-2 gap-3.5 pt-1">
                    {pagePhotos.map((photo, idx) => {
                      const globalIndex = pageIndex * PHOTOS_PER_PAGE + idx + 1;
                      return (
                        <div key={photo.id || idx} className="border border-black p-2 bg-white rounded-sm flex flex-col items-center">
                          <div className="h-44 w-full flex items-center justify-center bg-neutral-50 overflow-hidden mb-1.5 border border-neutral-200 rounded-sm">
                            <img
                              src={photo.dataUrl || photo.url}
                              alt={photo.name}
                              className="max-h-44 w-auto max-w-full object-contain"
                              loading="eager"
                            />
                          </div>
                          <div className="w-full flex items-center justify-between text-[12px] text-neutral-900 px-1">
                            <span className="font-bold font-sarabun text-black">รูปที่ {globalIndex}</span>
                            <span className="font-mono text-[11px] text-neutral-600 truncate max-w-[180px]" title={photo.name}>
                              {photo.name || `photo_${globalIndex}.jpg`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer for Photo Appendix Page */}
                <div className="pt-1.5 mt-2 border-t border-black/30 flex justify-between items-center text-[11px] text-neutral-600">
                  <span>การบำรุงรักษาเชิงป้องกันล่วงหน้า (Pre-Preventive Maintenance: Pre-PM) — {stationName}</span>
                  <span>หน้า {pageIndex + 2} จาก {totalPages}</span>
                </div>
              </div>
            ))}

          </div>

        </div>

      </div>
    </div>,
    document.body
  );
}
