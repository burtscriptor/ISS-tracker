import { useState, useEffect } from 'react'
import './App.css'
import img from './assets/components/astronaut.png'
import axios from 'axios'
import { GetApiKey } from './env'
import sunset from './assets/components/sunset.png'
import earth from './assets/components/trees.png'
import iss from './assets/components/iss.png'
import sunrise from './assets/components/sunrise.png'
import {
  Box,
  Flex,
} from '@chakra-ui/react'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMarkerRef,
  InfoWindow,
} from '@vis.gl/react-google-maps'

function App() {
  const [markerRef, marker] = useMarkerRef('one');
  const [open, setOpen] = useState(false);
  const [issLocation, setIssLocation] = useState({ lat: 0, lng: 0})
  const [inSpace, setInSpace] =  useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [show, setShow] = useState(true)
  
  useEffect(() => {
    if (!marker) {
      return;
    }
    console.log('do something with marker?')
  }, [marker])

  useEffect(() => {
    const intervalId = setInterval(() => {
      getIssLocation();
    }, 5000);
   
    return () => clearInterval(intervalId);
  }, [issLocation]);

  useEffect(()=>{
    getAstronauts();
    setIsLoading(false);
  },[])

  const getIssLocation =  async () => {
    const res = await axios.get('http://api.open-notify.org/iss-now.json')
    const {longitude, latitude} = await res.data.iss_position
    setIssLocation( { lat: parseFloat(latitude), lng: parseFloat(longitude)} )
  };
    
  const getAstronauts = async () => {
    const res = await axios.get('http://api.open-notify.org/astros.json')
    setInSpace(res.data)
  };


  const apiKey = GetApiKey();

  return (
    <>
    {isLoading ? <p>Loading..</p> : 
      <Flex 
        position='relative'
        flexDirection='column'
        alignItems='center'
        justifyContent='center'
        h='100vh'
        w='100vw'
      >
        {inSpace ? 
          <Box
            position='relative'
            display='flex'
            flexDirection='column'
            alignItems='center'
            justifyContent='center'>
            <div className='info'>
              <p>The <img className='icons' src={iss} /> orbits the <img className='icons' src={earth} /> every 90 minutes, which gives the <img className='icons' src={img} /> 16 <img className='icons' src={sunrise} /> and <img src={sunset} className='icons'/> every day.</p>
            </div>
            <div className={show ? "in-space" : "hide"} >
              <p>Click on the astronaut!</p>
            </div>
          </Box>
          : <p></p>
        }
        <Box position='relative' left={0} top={0} h='80%' w='100%'>
          <APIProvider apiKey={apiKey}>
            <Map 
              mapId={'269bcd1f5ba584f8'} 
              mapTypeId={'satellite'}
              defaultCenter={issLocation}
              defaultZoom={5}
              mapContainerStyle={{ width: '100%', height:'100%'}}
              onLoad={map => setMap(map)}
            >
              <AdvancedMarker position={issLocation} onClick={()=> setOpen(true) + setShow(false)} >
                <img className='icon' src={img} />
              </AdvancedMarker>
              {open && inSpace && 
                <InfoWindow position={issLocation} onCloseClick={() => setOpen(false)}>
                  We're on the ISS!
                  {inSpace.people.map((person,index) => ( <p key={[index]}>{person.name}</p>))}
                </InfoWindow>
              }
            </Map>
          </APIProvider>
        </Box>
      </Flex>
    }
  </>
  )
};

export default App;
