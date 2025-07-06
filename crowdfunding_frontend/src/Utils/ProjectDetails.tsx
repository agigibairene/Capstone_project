import  { useState } from 'react';
import { FileText, Download, Share2, ZoomIn, ZoomOut, RotateCw, Users, Calendar, MapPin, MessageCircle } from 'lucide-react';

export default function ProjectDetails() {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const totalPages = 4;

  const collaborators = [
    { name: 'Jon T.', avatar: 'JT', color: 'bg-blue-500' },
    { name: 'Richard P.', avatar: 'RP', color: 'bg-green-500' },
    { name: 'Jon C.', avatar: 'JC', color: 'bg-purple-500' },
    { name: 'View A.', avatar: 'VA', color: 'bg-orange-500' },
    { name: 'George H. (You)', avatar: 'GH', color: 'bg-red-500' }
  ];

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium">License Agreement on Waterfall Inc.pdf</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-700 rounded">
              <Download className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-700 rounded">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Document Viewer */}
        <div className="flex-1 flex overflow-hidden">
          {/* Document Content */}
          <div className="flex-1 bg-gray-900 overflow-y-auto scrollbar-hide">
            <div className="p-6">
              <div className="bg-white rounded-lg shadow-2xl p-8 text-gray-900 max-w-4xl mx-auto">
                {/* Document Header */}
                <div className="text-center mb-8">
                  <h1 className="text-xl font-bold mb-2">WATERFALL INC</h1>
                  <h2 className="text-lg font-semibold">SOFTWARE END USER LICENSE AGREEMENT</h2>
                </div>

                {/* Document Content */}
                <div className="space-y-4 text-sm leading-relaxed">
                  <p>
                    This End User License Agreement ("License") is an agreement between you and Waterfall Inc. By 
                    downloading and using the SOFTWARE, you agree to be bound by the terms of this License. If you do not 
                    agree to the terms of this License, do not download or use the SOFTWARE.
                  </p>
                  
                  <p>
                    You may use the SOFTWARE only on devices that you own or control and as permitted by the App Store 
                    Terms of Service. The SOFTWARE is licensed, not sold, to you by Waterfall Inc for use strictly in 
                    accordance with the terms of this License.
                  </p>

                  <p>
                    By installing or using the Application, you consent to be bound by this License, Service Level License 
                    Agreement, and Privacy Policy. If you do not agree to be bound by the terms of this License, you may not 
                    download or use the Application. Waterfall Inc reserves the right to modify and change these terms at any 
                    time with or without notice to you.
                  </p>

                  <p>
                    Waterfall Inc makes no warranties or representations about the suitability of the information 
                    contained in the documents and related graphics published on this server for any purpose. All such 
                    documents and related graphics are provided "as is" without warranty of any kind.
                  </p>

                  <h3 className="font-semibold mt-6 mb-3">1. LICENSE GRANT AND RESTRICTIONS</h3>
                  
                  <p>
                    A. Grant of License: You are granted a limited, non-exclusive license to install and use the Application for 
                    your personal, non-commercial use on a single device. You may not copy, modify, distribute, sell, or lease 
                    any part of the Application or included software, nor may you reverse engineer or attempt to extract the 
                    source code of the Application.
                  </p>

                  <p>
                    B. Restrictions: You may not use the Application for any purpose that is unlawful or prohibited by this 
                    Agreement. You may not modify the Application or use it on any device that you do not own or control.
                  </p>

                  <p>
                    C. Copies: You may download the Application onto an authorized device. The number of copies that you 
                    may download during any particular period of time may be limited. You may not have more than one 
                    Application installed at a time, and you may not make copies of any part of the Application.
                  </p>

                  <h3 className="font-semibold mt-6 mb-3">2. OWNERSHIP AND INTELLECTUAL PROPERTY</h3>
                  
                  <p>
                    The Application and all copyrights, patents, trade secrets, trademarks, and other intellectual property 
                    rights in the Application are owned by Waterfall Inc. You acknowledge that you are obtaining only a 
                    limited license right to use the Application and that irrespective of any use of the words "purchase," 
                    "sale," or like terms, no ownership rights are being conveyed to you under this Agreement.
                  </p>

                  <p>
                    You may not modify, reverse engineer, decompile, or disassemble the Application in whole or in part, 
                    or create derivative works from the Application. You may not remove, alter, or obscure any proprietary 
                    notices on the Application.
                  </p>

                  <h3 className="font-semibold mt-6 mb-3">3. PRIVACY AND DATA COLLECTION</h3>
                  
                  <p>
                    Waterfall Inc respects your privacy and is committed to protecting your personal information. Our 
                    Privacy Policy explains how we collect, use, and protect your information when you use our Application. 
                    By using the Application, you consent to the collection and use of your information as described in our 
                    Privacy Policy.
                  </p>

                  <p>
                    We may collect anonymous usage data to improve our services. This data does not identify you personally 
                    and is used solely for analytical purposes to enhance user experience and application performance.
                  </p>

                  <h3 className="font-semibold mt-6 mb-3">4. UPDATES AND MODIFICATIONS</h3>
                  
                  <p>
                    Waterfall Inc may provide updates to the Application from time to time. These updates may include bug 
                    fixes, security patches, and new features. You agree to install updates as they become available to 
                    maintain the security and functionality of the Application.
                  </p>

                  <p>
                    We reserve the right to modify or discontinue the Application at any time without notice. We will not 
                    be liable to you or any third party for any modification, suspension, or discontinuation of the Application.
                  </p>

                  <h3 className="font-semibold mt-6 mb-3">5. TERMINATION</h3>
                  
                  <p>
                    This License is effective until terminated. You may terminate this License at any time by destroying 
                    all copies of the Application in your possession or control. This License will terminate immediately 
                    without notice from Waterfall Inc if you fail to comply with any provision of this License.
                  </p>

                  <p>
                    Upon termination, you must cease all use of the Application and destroy all copies of the Application 
                    in your possession or control. The terms of this License that by their nature should survive termination 
                    will survive termination, including but not limited to ownership provisions, warranty disclaimers, 
                    and limitations of liability.
                  </p>

                  <h3 className="font-semibold mt-6 mb-3">6. DISCLAIMER OF WARRANTIES</h3>
                  
                  <p>
                    THE APPLICATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. WATERFALL INC DISCLAIMS ALL 
                    WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, 
                    FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                  </p>

                  <p>
                    WATERFALL INC DOES NOT WARRANT THAT THE APPLICATION WILL MEET YOUR REQUIREMENTS OR THAT THE OPERATION 
                    OF THE APPLICATION WILL BE UNINTERRUPTED OR ERROR-FREE.
                  </p>

                  <h3 className="font-semibold mt-6 mb-3">7. LIMITATION OF LIABILITY</h3>
                  
                  <p>
                    IN NO EVENT SHALL WATERFALL INC BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR 
                    PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR USE, ARISING OUT OF OR IN 
                    CONNECTION WITH THIS LICENSE OR THE USE OF THE APPLICATION.
                  </p>

                  <p>
                    WATERFALL INC'S TOTAL LIABILITY TO YOU FOR ALL DAMAGES SHALL NOT EXCEED THE AMOUNT PAID BY YOU FOR 
                    THE APPLICATION, IF ANY.
                  </p>

                  <h3 className="font-semibold mt-6 mb-3">8. GOVERNING LAW</h3>
                  
                  <p>
                    This License shall be governed by and construed in accordance with the laws of the State of California, 
                    without regard to its conflict of laws principles. Any disputes arising under this License shall be 
                    resolved in the courts of California.
                  </p>

                  <p>
                    If any provision of this License is held to be invalid or unenforceable, the remaining provisions 
                    shall remain in full force and effect.
                  </p>

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      By installing or using the Application, you acknowledge that you have read this License, understand 
                      it, and agree to be bound by its terms and conditions.
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Last updated: January 25, 2025
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-80 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
            {/* File Details */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3 text-gray-300">File Details</h3>
              <div className="bg-gray-700 rounded-lg p-3 text-sm">
                <div className="text-gray-400 mb-1">License Agreement on Waterfall Inc.pdf</div>
                <div className="text-xs text-gray-500">1.1 MB</div>
              </div>
            </div>

            {/* Document Info */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3 text-gray-300">Document Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">Last Modified:</span>
                  <span>Jan 25, 2025</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">Location:</span>
                  <span>07 Cyber</span>
                </div>
              </div>
            </div>

            {/* Collaborators */}
            <div>
              <h3 className="text-sm font-medium mb-3 text-gray-300">Collaborators</h3>
              <div className="space-y-2">
                {collaborators.map((collaborator, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full ${collaborator.color} flex items-center justify-center text-white text-xs font-medium`}>
                      {collaborator.avatar}
                    </div>
                    <span className="text-sm">{collaborator.name}</span>
                    <div className="w-3 h-3 bg-green-500 rounded-full ml-auto"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Toolbar */}
        <div className="bg-gray-800 border-t border-gray-700 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                className="p-1 hover:bg-gray-700 rounded"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium min-w-12 text-center">{zoom}%</span>
              <button 
                onClick={() => setZoom(Math.min(200, zoom + 10))}
                className="p-1 hover:bg-gray-700 rounded"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
            <button className="p-1 hover:bg-gray-700 rounded">
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm">
              {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <MessageCircle className="w-4 h-4 text-gray-400" />
            <Users className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}