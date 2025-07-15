"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  Users,
  DollarSign,
  Building,
  Printer,
  ArrowLeft,
  IdCard,
  Clock,
  School2,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

type EmployeeProfile = {
  id: string;
  name: string;
  nameMother: string;
  gender: string;
  dateOfBirth: string;
  certificate: string;
  graduationYear: string;
  specialty: string;
  workPosition: string;
  profession: string;
  residence: string;
  maritalStatus: string;
  numberOfChildren: string;
  bloodType: string;
  phoneNumber: string;
  email: string;
  workStartDate: string;
  establishmentType: string;
  salary: string;
  workLocation: string;
  profileImage?: string;
  assignedUserName?: string;
  createdAt: string;
};

const EmployeeCVPrintPage = () => {
  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const url = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    // Manually get query params from the URL
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const id = params.get("id");

    if (!id) {
      toast.error("ناسنامەی کارمەند نەدۆزرایەوە");
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const res = await axios.get(`${url}employeeProfile/fetchById/${id}`);
        setEmployee(res.data);
      } catch (error) {
        console.error("Error fetching employee data:", error);
        toast.error("هەڵەیەک ڕوویدا لە کاتێکی وەرگرتنی زانیاریەکان.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const goBack = () => {
    window.close();
  };

  const calculationServices = (startDate: string) => {
    const start = new Date(startDate);
    const today = new Date();

    // Calculate difference in milliseconds
    const diffTime = Math.abs(today.getTime() - start.getTime());

    // Convert to days
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Calculate years, months and remaining days
    const years = Math.floor(totalDays / 365);
    const months = Math.floor((totalDays % 365) / 30);
    const days = Math.floor(totalDays % 30);

    // Construct Kurdish language response
    let response = "";

    if (years > 0) {
      response += `${years} ساڵ `;
    }
    if (months > 0) {
      response += `${months} مانگ `;
    }
    if (days > 0) {
      response += `${days} ڕۆژ`;
    }

    if (!response) {
      return "کەمتر لە ڕۆژێک";
    }

    return response.trim();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">بارکردنی زانیاری کارمەند...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">کارمەند نەدۆزرایەوە</h2>
          <p className="text-muted-foreground mb-4">
            ناسنامەی کارمەند نادروستە یان نابوونی هەیە
          </p>
          <Button onClick={goBack} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            گەڕانەوە
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Print Controls - Hidden during print */}
      <div className="print:hidden bg-white border-b p-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">
              زانیاری کارمەند - {employee.name}
            </h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={goBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              گەڕانەوە
            </Button>
            <Button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Printer className="mr-2 h-4 w-4" />
              چاپکردن
            </Button>
          </div>
        </div>
      </div>

      {/* Modern CV Content */}
      <div className="cv-container">
        <div className="cv-page">
          {/* Side Panel */}
          <div className="side-panel">
            <div className="profile-section">
              {employee.profileImage ? (
                <div className="profile-image">
                  <img src={employee.profileImage} alt={employee.name} />
                </div>
              ) : (
                <div className="profile-placeholder">
                  <User className="user-icon" />
                </div>
              )}
            </div>

            <div className="side-section contact-info">
              <h3 className="side-section-title">زانیاری پەیوەندی</h3>
              <div className="side-info-item">
                <Phone className="side-icon" />
                <span>{employee.phoneNumber}</span>
              </div>
              <div className="side-info-item">
                <Mail className="side-icon" />
                <span>{employee.email}</span>
              </div>
              <div className="side-info-item">
                <MapPin className="side-icon" />
                <span>{employee.residence}</span>
              </div>
              <div className="side-info-item">
                <School2 className="side-icon" />
                <span>{employee.workLocation}</span>
              </div>
            </div>

            <div className="side-section personal-info">
              <h3 className="side-section-title">زانیاری کەسی</h3>
              <div className="side-info-item">
                <span className="text-bold text-foreground">
                  ناوی سیانی دایک :
                </span>
                <span>{employee.nameMother}</span>
              </div>
              <div className="side-info-item">
                <span className="text-bold text-foreground">ڕەگەز:</span>
                <span>{employee.gender}</span>
              </div>
              <div className="side-info-item">
                <span className="text-bold text-foreground">
                  ڕێکەوتی لەدایکبوون:
                </span>
                <span>
                  {new Date(employee.dateOfBirth).toLocaleDateString("ku")}
                </span>
              </div>
              <div className="side-info-item">
                <span className="text-bold text-foreground">
                  باری خێزانداری:
                </span>
                <span>{employee.maritalStatus}</span>
              </div>
              <div className="side-info-item">
                <span className="text-bold text-foreground">
                  ژمارەی منداڵان:
                </span>
                <span>{employee.numberOfChildren}</span>
              </div>
              <div className="side-info-item">
                <span className="text-bold text-foreground">جۆری خوێن:</span>
                <span>{employee.bloodType}</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="main-content">
            <div className="header-section">
              <h1 className="employee-name">{employee.name}</h1>
              <p className="employee-position">{employee.profession}</p>
              <h2 className=" employee-profession">{employee.workPosition}</h2>
            </div>

            <div className="content-section education">
              <div className="section-header">
                <GraduationCap className="section-icon" />
                <h3 className="section-title">زانیاری خوێندن</h3>
              </div>
              <div className="section-content">
                <div className="info-grid">
                  <div className="flex gap-4">
                    <span className="info-label flex"> بڕوانامە :</span>
                    <span className="info-value">{employee.certificate}</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="info-label">ساڵی دەرچوون :</span>
                    <span className="info-value">
                      {employee.graduationYear}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="info-label">پسپۆڕی :</span>
                    <span className="info-value">{employee.specialty}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="content-section work-info">
              <div className="section-header">
                <Briefcase className="section-icon" />
                <h3 className="section-title">زانیاری کار</h3>
              </div>
              <div className="section-content">
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">پۆستی کار:</span>
                    <span className="info-value">{employee.workPosition}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">پیشە:</span>
                    <span className="info-value">{employee.profession}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">دەستپێکردنی کار:</span>
                    <span className="info-value">
                      {new Date(employee.workStartDate).toLocaleDateString(
                        "ku"
                      )}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">جۆری دامەزراندن:</span>
                    <span className="info-value">
                      {employee.establishmentType}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">مووچە:</span>
                    <span className="info-value">{employee.salary} دینار</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">ماوەی خزمەت:</span>
                    <span className="info-value">
                      {calculationServices(employee.workStartDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {employee.assignedUserName && (
              <div className="content-section assignment-info">
                <div className="section-header">
                  <IdCard className="section-icon" />
                  <h3 className="section-title">زانیاری دیاریکراو</h3>
                </div>
                <div className="section-content">
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">دیاریکراو بۆ:</span>
                      <span className="info-value">
                        {employee.assignedUserName}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">ڕێکەوتی دروستکردن:</span>
                      <span className="info-value">
                        {new Date(employee.createdAt).toLocaleDateString("ku")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modern CV Styles */}
      <style jsx global>{`
        * {
          direction: rtl;
          text-align: right;
          font-family: "nrt";
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
          background: #f8fafc;
        }

        .cv-container {
          min-height: 100vh;
          background: #f8fafc;
          padding: 20px;
          display: flex;
          justify-content: center;
        }

        .cv-page {
          width: 210mm;
          min-height: 297mm;
          background: white;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          display: flex;
          overflow: hidden;
          position: relative;
        }

        /* Side Panel */
        .side-panel {
          width: 75mm;
          background: #3c8e8f;
          color: white;
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .profile-section {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }

        .profile-image {
          width: 130px;
          height: 130px;
          border-radius: 50%;
          overflow: hidden;
          border: 4px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .profile-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-placeholder {
          width: 130px;
          height: 130px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 4px solid rgba(255, 255, 255, 0.3);
        }

        .user-icon {
          width: 60px;
          height: 60px;
          color: rgba(255, 255, 255, 0.8);
        }

        .side-section {
          margin-bottom: 25px;
        }

        .side-section-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 2px solid rgba(255, 255, 255, 0.2);
        }

        .side-info-item {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 12px;
          font-size: 14px;
        }

        .side-icon {
          width: 16px;
          height: 16px;
          opacity: 0.8;
        }

        .info-label {
          font-weight: 600;
          opacity: 0.8;
          margin-right: 5px;
        }

        /* Main Content */
        .main-content {
          flex: 1;
          padding: 40px 30px;
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .header-section {
          margin-bottom: 20px;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 20px;
        }

        .employee-name {
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 5px 0;
          color: #3c8e8f;
        }

        .employee-position {
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 5px 0;
          color: #3b82f6;
        }

        .employee-profession {
          font-size: 16px;
          color: #64748b;
          margin: 0;
        }

        .content-section {
          margin-bottom: 25px;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 10px;
        }

        .section-icon {
          width: 20px;
          height: 20px;
          color: #3b82f6;
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #3c8e8f;
          margin: 0;
        }

        .section-content {
          padding: 0 5px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .info-label {
          font-weight: 600;
          color: #64748b;
          font-size: 14px;
        }

        .info-value {
          color: #1e293b;
          font-size: 15px;
        }

        /* Print Styles */
        @media print {
          @page {
            size: A4;
            margin: 0;
          }

          body {
            margin: 0;
            padding: 0;
            background: white;
          }

          .cv-container {
            padding: 0;
            min-height: auto;
            background: white;
          }

          .cv-page {
            width: 100%;
            height: 100%;
            box-shadow: none;
            margin: 0;
          }

          .side-panel {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .header-section {
            margin-top: 0;
          }
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .cv-page {
            flex-direction: column;
            width: 100%;
            min-height: auto;
          }

          .side-panel {
            width: 100%;
            padding: 30px 20px;
          }

          .main-content {
            padding: 30px 20px;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
};

export default EmployeeCVPrintPage;
