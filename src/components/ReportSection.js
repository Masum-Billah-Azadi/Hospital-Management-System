// src/components/ReportSection.js
"use client";

import { DocumentTextIcon, EyeIcon, PhotoIcon } from "@heroicons/react/24/solid";
import { Button, Card, CardBody, CardHeader, IconButton, List, ListItem, ListItemSuffix, Typography } from "@material-tailwind/react";

const ReportSection = ({
  reports = [],
  isUploading = false,
  handleReportUpload,
  showGenerateButton = false,
  pageType = "patient" // 'doctor' বা 'patient'
}) => {
  return (
    <Card className="w-full bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
      <CardHeader floated={false} shadow={false} className="rounded-none bg-transparent">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <Typography variant="h6" className="text-light-text-primary dark:text-dark-text-primary">
            {pageType === "doctor" ? "Medical Reports" : "Your Reports"}
          </Typography>

          <div className="flex items-center gap-2 text-light-text-primary dark:text-dark-text-primary">
            {showGenerateButton && (
              <a href="https://hms-psi-three.vercel.app/" target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="filled" color="blue-gray">
                  Generate Report
                </Button>
              </a>
            )}

            <label
              htmlFor={`report-upload-${pageType}`}
              className={`cursor-pointer inline-block text-sm font-medium py-2 px-4 rounded-lg transition-colors 
              ${
                isUploading
                  ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 hover:bg-gray-200 text-light-text-secondary dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-dark-text-secondary"
              }`}
            >
              {isUploading ? "Uploading..." : "Upload New"}
            </label>
            <input
              type="file"
              id={`report-upload-${pageType}`}
              hidden
              onChange={handleReportUpload}
              disabled={isUploading}
              accept="image/*, application/pdf"
            />
          </div>
        </div>
      </CardHeader>

      <CardBody>
        <List>
          {reports && reports.length > 0 ? (
            reports
              .slice()
              .reverse()
              .map((report, index) => (
                <ListItem
                  key={index}
                  className="rounded-lg mb-2 bg-light-bg dark:bg-dark-bg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Typography variant="small" className="font-bold opacity-70">
                      {index + 1}.
                    </Typography>
                    {report.fileName.endsWith(".pdf") ? (
                      <DocumentTextIcon className="h-6 w-6 text-red-500" />
                    ) : (
                      <PhotoIcon className="h-6 w-6 text-blue-500" />
                    )}
                  </div>
                  <a
                    href={report.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={report.fileName}
                    className="flex-1 mx-4 truncate hover:underline text-light-text-primary dark:text-dark-text-primary"
                  >
                    {report.fileName}
                  </a>
                  <ListItemSuffix>
                    <a href={report.url} target="_blank" rel="noopener noreferrer">
                      <IconButton variant="text">
                        <EyeIcon className="h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary" />
                      </IconButton>
                    </a>
                  </ListItemSuffix>
                </ListItem>
              ))
          ) : (
            <Typography variant="small" className="p-4 text-center opacity-70">
              No reports uploaded.
            </Typography>
          )}
        </List>
      </CardBody>
    </Card>
  );
};

export default ReportSection;
