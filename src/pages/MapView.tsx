import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Globe, Plus, Minus, MapPin, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const MapView: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [zoom, setZoom] = useState(12);
  const [lng, setLng] = useState(77.3500);
  const [lat, setLat] = useState(28.6700);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [popupInfo, setPopupInfo] = useState({
    title: '',
    description: '',
    company: '',
    salary: '',
  });

  useEffect(() => {
    if (map.current) return; // prevent initialize map more than once
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: zoom
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('move', () => {
      setLng(map.current?.getCenter().lng.toFixed(4) as any);
      setLat(map.current?.getCenter().lat.toFixed(4) as any);
      setZoom(map.current?.getZoom().toFixed(2) as any);
    });

    // Sample job postings (replace with actual data)
    const jobPostings = [
      {
        id: 1,
        title: 'Part-Time Barista',
        description: 'Brew coffee, take orders, and provide excellent customer service.',
        company: 'Coffee Bliss Cafe',
        salary: '₹8,000 - ₹12,000 / month',
        location: [77.3550, 28.6750],
      },
      {
        id: 2,
        title: 'Delivery Driver',
        description: 'Deliver food orders quickly and safely to customers.',
        company: 'Quick Eats Delivery',
        salary: '₹10,000 - ₹15,000 / month',
        location: [77.3450, 28.6650],
      },
      {
        id: 3,
        title: 'Retail Assistant',
        description: 'Assist customers, manage inventory, and maintain store cleanliness.',
        company: 'Fashion Hub Retail',
        salary: '₹9,000 - ₹13,000 / month',
        location: [77.3600, 28.6800],
      },
    ];

    // Add markers for job postings
    jobPostings.forEach((job) => {
      const marker = new mapboxgl.Marker()
        .setLngLat(job.location)
        .addTo(map.current as mapboxgl.Map);

      const popupContent = `
        <div class="job-popup">
          <h4>${job.title}</h4>
          <p>${job.company}</p>
          <p>${job.salary}</p>
          <button class="apply-button">Apply Now</button>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(popupContent);

      marker.setPopup(popup);
    });

  }, []);

  return (
    <div className="map-container relative">
      <div ref={mapContainer} className="mapboxgl-map" />
      <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-lg p-2 shadow-md z-10">
        <div>Longitude: {lng}</div>
        <div>Latitude: {lat}</div>
        <div>Zoom: {zoom}</div>
      </div>

      <style>
        {`.mapboxgl-map {
          font: inherit;
          height: 100vh;
        }
        .mapboxgl-popup {
          max-width: 320px !important;
        }
        .mapboxgl-popup-content {
          padding: 0 !important;
          border-radius: 12px !important;
          overflow: hidden;
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15) !important;
        }
        .mapboxgl-popup-close-button {
          font-size: 16px !important;
          color: #6b7280 !important;
        }
        .mapboxgl-popup-tip {
          display: none !important;
        }
        .job-popup {
          padding: 0.75rem;
        }`}
      </style>
    </div>
  );
};

export default MapView;
