import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for Leaflet default icon not showing
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const POSITION: [number, number] = [-6.32109656207519, 106.90716737036655];
const ADDRESS = "Politeknik Prestasi Prima, RW.5, Bambu Apus Kec. Cipayung Kota Jakarta Timur Daerah Khusus Ibukota Jakarta";

export const WeddingMap = () => {
  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white/50 relative z-0">
      <MapContainer 
        center={POSITION} 
        zoom={15} 
        scrollWheelZoom={false} 
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <Marker position={POSITION}>
          <Popup className="font-sans text-sm">
            <div className="font-bold mb-1">Wedding Location</div>
            {ADDRESS}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};
