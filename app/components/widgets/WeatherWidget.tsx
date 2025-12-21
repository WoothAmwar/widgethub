'use client';

import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, Loader2, MapPin } from 'lucide-react';

interface WeatherData {
  temperature: number;
  condition: string;
  city: string;
}

interface WeatherWidgetProps {
  blur?: number;
  settings?: {
      city?: string;
  };
  onSettingsChange?: (settings: { city: string }) => void;
}

export default function WeatherWidget({ blur = 0, settings, onSettingsChange }: WeatherWidgetProps) {
  const [city, setCity] = useState(settings?.city || 'New York');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditingCity, setIsEditingCity] = useState(false);
  const [inputCity, setInputCity] = useState(city);

  useEffect(() => {
    if (settings?.city) {
        setCity(settings.city);
        fetchWeather(settings.city);
    } else {
        fetchWeather(city); // Default
    }
  }, []); // Run once on mount if settings provided, or if defaults needed.

  // Re-fetch if settings change externally
   useEffect(() => {
    if (settings?.city && settings.city !== city) {
        setCity(settings.city);
        fetchWeather(settings.city);
    }
  }, [settings?.city]);


  const fetchWeather = async (cityName: string) => {
    setLoading(true);
    try {
      // 1. Geocoding
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`);
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('City not found');
      }

      const { latitude, longitude, name } = geoData.results[0];

      // 2. Weather
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
      const weatherData = await weatherRes.json();

      setWeather({
        temperature: weatherData.current_weather.temperature,
        condition: decodeWeatherCode(weatherData.current_weather.weathercode),
        city: name
      });
    } catch (error) {
      console.error(error);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const decodeWeatherCode = (code: number): string => {
      // Simplified mapping
      if (code <= 3) return 'Clear';
      if (code <= 48) return 'Cloudy';
      if (code <= 67) return 'Rain';
      if (code <= 77) return 'Snow';
      if (code <= 82) return 'Rain';
      if (code <= 86) return 'Snow';
      if (code <= 99) return 'Storm';
      return 'Unknown';
  };

  const getWeatherIcon = (condition: string) => {
      switch (condition) {
          case 'Clear': return <Sun className="text-yellow-400" size={48} />;
          case 'Cloudy': return <Cloud className="text-gray-400" size={48} />;
          case 'Rain': return <CloudRain className="text-blue-400" size={48} />;
          case 'Snow': return <CloudSnow className="text-white" size={48} />;
          default: return <Sun className="text-yellow-400" size={48} />;
      }
  };

  const handleCitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCity(inputCity);
    setIsEditingCity(false);
    fetchWeather(inputCity);
    if (onSettingsChange) {
        onSettingsChange({ city: inputCity });
    }
  };

  return (
    <div 
        className="flex flex-col h-full w-full rounded-2xl p-6 text-white shadow-lg overflow-hidden relative bg-black/30"
        style={{ backdropFilter: `blur(${blur}px)` }}
    >
        {isEditingCity ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <form onSubmit={handleCitySubmit} className="flex flex-col gap-2 w-full">
                    <input 
                        type="text" 
                        value={inputCity} 
                        onChange={e => setInputCity(e.target.value)} 
                        placeholder="Enter City"
                        className="bg-white/10 p-2 rounded text-center focus:outline-none"
                        autoFocus
                    />
                    <button type="submit" className="bg-white/20 p-2 rounded hover:bg-white/30 text-xs font-bold">Search</button>
                    <button type="button" onClick={() => setIsEditingCity(false)} className="text-white/50 text-xs hover:text-white">Cancel</button>
                </form>
            </div>
        ) : (
           <>
              {loading ? (
                  <div className="flex-1 flex items-center justify-center">
                      <Loader2 className="animate-spin text-white/50" size={32} />
                  </div>
              ) : weather ? (
                <div className="flex flex-col items-center justify-between h-full py-4">
                    <div className="flex items-center gap-2 cursor-pointer hover:bg-white/10 px-2 py-1 rounded transition" onClick={() => { setIsEditingCity(true); setInputCity(city); }}>
                        <MapPin size={16} className="text-white/70" />
                        <span className="font-medium text-lg">{weather.city}</span>
                    </div>
                    
                    <div className="flex flex-col items-center">
                        {getWeatherIcon(weather.condition)}
                        <span className="text-4xl font-bold mt-2">{Math.round((weather.temperature * 9/5) + 32)}°F</span>
                        {/* <span className="text-white/60 text-sm mt-1">{Math.round((weather.temperature * 9/5) + 32)}°F</span> */}
                    </div>

                    <div className="text-white/70 font-medium">
                        {weather.condition}
                    </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-white/50 cursor-pointer" onClick={() => setIsEditingCity(true)}>
                    <span>Tap to set city</span>
                </div>
              )}
           </>
        )}
    </div>
  );
}

