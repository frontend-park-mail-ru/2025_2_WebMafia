const API_BASE_URL = 'http://localhost:8080/api/v1';

export class apiServises{
    constructor() {
        this.baseURL = API_BASE_URL;
    }
    //подключаемся для запроса
    async request(endpoint, options = {}){
        const url = `${this.baseURL}${endpoint}`;
        console.log(`Fetching: ${url}`);
        const config ={
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try{
            const response = await fetch(url, config);  
            if (!response.ok){
                throw new Error('Response was not ok');
            } 
            console.log(`Success: ${endpoint}`, data);
            return await response.json(); 
        } catch(error) {
            console.error('Error whiile fetching', error);
            throw error;
        }
    }
    //запрашиваем данные для главной страницы
    async getMainPageData(){
        // return this.request('/home');
        return {data: {...(await this.getArtists()), ...(await this.getAlbums()), ...(await this.getTracks())}}
    }

    async getArtists(){
        // const data = await this.request('/artists');
        // return data.artists || [];
        return {  "artists": [
    {
      "artist_id": 1,
      "name": "Tyler, the Creator",
      "avatar_url": "image1.jpg",
      "created_at": "2025-09-28T15:05:37.547879876+03:00",
      "updated_at": "0001-01-01T00:00:00Z"
    },
    {
      "artist_id": 2,
      "name": "Mac Miller",
      "avatar_url": "image2.jpg",
      "created_at": "2025-09-28T15:05:37.547883158+03:00",
      "updated_at": "0001-01-01T00:00:00Z"
    },
    {
      "artist_id": 3,
      "name": "Jpegmafia",
      "avatar_url": "image3.jpg",
      "created_at": "2025-09-28T15:05:37.547885952+03:00",
      "updated_at": "0001-01-01T00:00:00Z"
    },
    {
      "artist_id": 4,
      "name": "The roots",
      "avatar_url": "image4.jpg",
      "created_at": "2025-09-28T15:05:37.547889304+03:00",
      "updated_at": "0001-01-01T00:00:00Z"
    },
    {
      "artist_id": 5,
      "name": "Iggy Pop",
      "avatar_url": "image5.jpg",
      "created_at": "2025-09-28T15:05:37.547892656+03:00",
      "updated_at": "0001-01-01T00:00:00Z"
    },
    {
      "artist_id": 6,
      "name": "Молчат дома",
      "avatar_url": "image6.jpg",
      "created_at": "2025-09-28T15:05:37.54789552+03:00",
      "updated_at": "0001-01-01T00:00:00Z"
    },
    {
      "artist_id": 7,
      "name": "Arctic Monkeys",
      "avatar_url": "image7.jpg",
      "created_at": "2025-09-28T15:05:37.547898802+03:00",
      "updated_at": "0001-01-01T00:00:00Z"
    },
    {
      "artist_id": 8,
      "name": "Kali Uchis",
      "avatar_url": "image8.jpg",
      "created_at": "2025-09-28T15:05:37.547902154+03:00",
      "updated_at": "0001-01-01T00:00:00Z"
    },
    {
      "artist_id": 9,
      "name": "Playboi Carti",
      "avatar_url": "image9.jpg",
      "created_at": "2025-09-28T15:05:37.547905088+03:00",
      "updated_at": "0001-01-01T00:00:00Z"
    },
    {
      "artist_id": 10,
      "name": "The Weekend",
      "avatar_url": "image10.jpg",
      "created_at": "2025-09-28T15:05:37.54790851+03:00",
      "updated_at": "0001-01-01T00:00:00Z"
    }
  ]}
    }

    async getAlbums(){
        // const data = await this.request('/albums');
        // return data.albums || [];
        return { "albums": [
    {
      "album_id": 1,
      "title": "Flower boy",
      "avatar_url": "image11.jpg",
      "artist_id": 1,
      "artist": {
        "artist_id": 0,
        "name": "Tyler, the Creator",
        "avatar_url": "",
        "created_at": "0001-01-01T00:00:00Z",
        "updated_at": "0001-01-01T00:00:00Z"
      },
      "release_date": "2017-07-21T00:00:00Z",
      "created_at": "2025-09-28T15:05:37.547913259+03:00",
      "updated_at": "0001-01-01T00:00:00Z"
    },
    {
      "album_id": 2,
      "title": "Lust for life",
      "avatar_url": "image12.jpg",
      "artist_id": 5,
      "artist": {
        "artist_id": 0,
        "name": "",
        "avatar_url": "",
        "created_at": "0001-01-01T00:00:00Z",
        "updated_at": "0001-01-01T00:00:00Z"
      },
      "release_date": "1977-03-29T00:00:00Z",
      "created_at": "2025-09-28T15:05:37.547916541+03:00",
      "updated_at": "0001-01-01T00:00:00Z"
    },
    {
      "album_id": 3,
      "title": "All my heroes are cornballs",
      "avatar_url": "image13.jpg",
      "artist_id": 3,
      "artist": {
        "artist_id": 0,
        "name": "",
        "avatar_url": "",
        "created_at": "0001-01-01T00:00:00Z",
        "updated_at": "0001-01-01T00:00:00Z"
      },
      "release_date": "2019-09-13T00:00:00Z",
      "created_at": "2025-09-28T15:05:37.547919335+03:00",
      "updated_at": "0001-01-01T00:00:00Z"
    },
    {
      "album_id": 4,
      "title": "Things fall apart",
      "avatar_url": "image14.jpg",
      "artist_id": 4,
      "artist": {
        "artist_id": 0,
        "name": "",
        "avatar_url": "",
        "created_at": "0001-01-01T00:00:00Z",
        "updated_at": "0001-01-01T00:00:00Z"
      },
      "release_date": "1999-02-23T00:00:00Z",
      "created_at": "2025-09-28T15:05:37.547922617+03:00",
      "updated_at": "0001-01-01T00:00:00Z"
    },
    {
      "album_id": 5,
      "title": "Flower boy (Deluxe)",
      "avatar_url": "image15.jpg",
      "artist_id": 1,
      "artist": {
        "artist_id": 0,
        "name": "",
        "avatar_url": "",
        "created_at": "0001-01-01T00:00:00Z",
        "updated_at": "0001-01-01T00:00:00Z"
      },
      "release_date": "2017-12-01T00:00:00Z",
      "created_at": "2025-09-28T15:05:37.547926039+03:00",
      "updated_at": "0001-01-01T00:00:00Z"
    },
    {
      "album_id": 6,
      "title": "Veteran",
      "avatar_url": "image16.jpg",
      "artist_id": 3,
      "artist": {
        "artist_id": 0,
        "name": "",
        "avatar_url": "",
        "created_at": "0001-01-01T00:00:00Z",
        "updated_at": "0001-01-01T00:00:00Z"
      },
      "release_date": "2018-01-19T00:00:00Z",
      "created_at": "2025-09-28T15:05:37.547928903+03:00",
      "updated_at": "0001-01-01T00:00:00Z"
    },
    {
      "album_id": 7,
      "title": "AM",
      "avatar_url": "image17.jpg",
      "artist_id": 7,
      "artist": {
        "artist_id": 0,
        "name": "",
        "avatar_url": "",
        "created_at": "0001-01-01T00:00:00Z",
        "updated_at": "0001-01-01T00:00:00Z"
      },
      "release_date": "2013-09-09T00:00:00Z",
      "created_at": "2025-09-28T15:05:37.547932255+03:00",
      "updated_at": "0001-01-01T00:00:00Z"
    },
    {
      "album_id": 8,
      "title": "Isolation",
      "avatar_url": "image18.jpg",
      "artist_id": 8,
      "artist": {
        "artist_id": 0,
        "name": "",
        "avatar_url": "",
        "created_at": "0001-01-01T00:00:00Z",
        "updated_at": "0001-01-01T00:00:00Z"
      },
      "release_date": "2018-04-06T00:00:00Z",
      "created_at": "2025-09-28T15:05:37.547934629+03:00",
      "updated_at": "0001-01-01T00:00:00Z"
    },
    {
      "album_id": 9,
      "title": "Die Lit",
      "avatar_url": "image19.jpg",
      "artist_id": 9,
      "artist": {
        "artist_id": 0,
        "name": "",
        "avatar_url": "",
        "created_at": "0001-01-01T00:00:00Z",
        "updated_at": "0001-01-01T00:00:00Z"
      },
      "release_date": "2018-05-11T00:00:00Z",
      "created_at": "2025-09-28T15:05:37.547938051+03:00",
      "updated_at": "0001-01-01T00:00:00Z"
    },
    {
      "album_id": 10,
      "title": "After Hours",
      "avatar_url": "image20.jpg",
      "artist_id": 10,
      "artist": {
        "artist_id": 0,
        "name": "",
        "avatar_url": "",
        "created_at": "0001-01-01T00:00:00Z",
        "updated_at": "0001-01-01T00:00:00Z"
      },
      "release_date": "2020-03-20T00:00:00Z",
      "created_at": "2025-09-28T15:05:37.547941404+03:00",
      "updated_at": "0001-01-01T00:00:00Z"
    }
  ]}
    }

    async getTracks(){
        // const data = await this.request('/tracks');
        // return data.tracks || [];
        return {
  "tracks": [
    {
      "track_id": 1,
      "title": "See you again",
      "duration_ms": 180000,
      "file_url": "tyler_see_you_again.mp3",
      "created_at": "2025-09-28T15:05:37.547949435+03:00",
      "updated_at": "0001-01-01T00:00:00Z",
      "artists": [
        {
          "artist_id": 1,
          "name": "Tyler, the Creator",
          "avatar_url": "image1.jpg",
          "created_at": "2025-09-28T15:05:37.547879876+03:00",
          "updated_at": "0001-01-01T00:00:00Z"
        },
        {
          "artist_id": 8,
          "name": "Kali Uchis",
          "avatar_url": "image8.jpg",
          "created_at": "2025-09-28T15:05:37.547902154+03:00",
          "updated_at": "0001-01-01T00:00:00Z"
        }
      ],
      "genres": [
        {
          "genre_id": 1,
          "name": "Hip-Hop",
          "created_at": "2025-09-28T15:05:37.547863534+03:00"
        }
      ],
      "album": {
        "album_id": 1,
        "title": "Flower boy",
        "avatar_url": "image11.jpg",
        "artist_id": 1,
        "artist": {
          "artist_id": 0,
          "name": "",
          "avatar_url": "",
          "created_at": "0001-01-01T00:00:00Z",
          "updated_at": "0001-01-01T00:00:00Z"
        },
        "release_date": "2017-07-21T00:00:00Z",
        "created_at": "2025-09-28T15:05:37.547913259+03:00",
        "updated_at": "0001-01-01T00:00:00Z"
      }
    },
    {
      "track_id": 2,
      "title": "Kenan vs Kel",
      "duration_ms": 165000,
      "file_url": "peggy_kenan_vs_kel.mp3",
      "created_at": "2025-09-28T15:05:37.547952718+03:00",
      "updated_at": "0001-01-01T00:00:00Z",
      "artists": [
        {
          "artist_id": 3,
          "name": "Jpegmafia",
          "avatar_url": "image3.jpg",
          "created_at": "2025-09-28T15:05:37.547885952+03:00",
          "updated_at": "0001-01-01T00:00:00Z"
        }
      ],
      "genres": [
        {
          "genre_id": 1,
          "name": "Hip-Hop",
          "created_at": "2025-09-28T15:05:37.547863534+03:00"
        }
      ],
      "album": {
        "album_id": 6,
        "title": "Veteran",
        "avatar_url": "image16.jpg",
        "artist_id": 3,
        "artist": {
          "artist_id": 0,
          "name": "",
          "avatar_url": "",
          "created_at": "0001-01-01T00:00:00Z",
          "updated_at": "0001-01-01T00:00:00Z"
        },
        "release_date": "2018-01-19T00:00:00Z",
        "created_at": "2025-09-28T15:05:37.547928903+03:00",
        "updated_at": "0001-01-01T00:00:00Z"
      }
    },
    {
      "track_id": 3,
      "title": "Rather Lie",
      "duration_ms": 195000,
      "file_url": "carti_rather_lie.mp3",
      "created_at": "2025-09-28T15:05:37.547956+03:00",
      "updated_at": "0001-01-01T00:00:00Z",
      "artists": [
        {
          "artist_id": 9,
          "name": "Playboi Carti",
          "avatar_url": "image9.jpg",
          "created_at": "2025-09-28T15:05:37.547905088+03:00",
          "updated_at": "0001-01-01T00:00:00Z"
        }
      ],
      "genres": [
        {
          "genre_id": 1,
          "name": "Hip-Hop",
          "created_at": "2025-09-28T15:05:37.547863534+03:00"
        }
      ],
      "album": {
        "album_id": 9,
        "title": "Die Lit",
        "avatar_url": "image19.jpg",
        "artist_id": 9,
        "artist": {
          "artist_id": 0,
          "name": "",
          "avatar_url": "",
          "created_at": "0001-01-01T00:00:00Z",
          "updated_at": "0001-01-01T00:00:00Z"
        },
        "release_date": "2018-05-11T00:00:00Z",
        "created_at": "2025-09-28T15:05:37.547938051+03:00",
        "updated_at": "0001-01-01T00:00:00Z"
      }
    },
    {
      "track_id": 4,
      "title": "See you again (Remix)",
      "duration_ms": 210000,
      "file_url": "tyler_see_you_again_remix.mp3",
      "created_at": "2025-09-28T15:05:37.547958863+03:00",
      "updated_at": "0001-01-01T00:00:00Z",
      "artists": [
        {
          "artist_id": 1,
          "name": "Tyler, the Creator",
          "avatar_url": "image1.jpg",
          "created_at": "2025-09-28T15:05:37.547879876+03:00",
          "updated_at": "0001-01-01T00:00:00Z"
        },
        {
          "artist_id": 8,
          "name": "Kali Uchis",
          "avatar_url": "image8.jpg",
          "created_at": "2025-09-28T15:05:37.547902154+03:00",
          "updated_at": "0001-01-01T00:00:00Z"
        }
      ],
      "genres": [
        {
          "genre_id": 1,
          "name": "Hip-Hop",
          "created_at": "2025-09-28T15:05:37.547863534+03:00"
        }
      ],
      "album": {
        "album_id": 5,
        "title": "Flower boy (Deluxe)",
        "avatar_url": "image15.jpg",
        "artist_id": 1,
        "artist": {
          "artist_id": 0,
          "name": "",
          "avatar_url": "",
          "created_at": "0001-01-01T00:00:00Z",
          "updated_at": "0001-01-01T00:00:00Z"
        },
        "release_date": "2017-12-01T00:00:00Z",
        "created_at": "2025-09-28T15:05:37.547926039+03:00",
        "updated_at": "0001-01-01T00:00:00Z"
      }
    },
    {
      "track_id": 5,
      "title": "1539 N. Calvert",
      "duration_ms": 172000,
      "file_url": "peggy_1539_calvert.mp3",
      "created_at": "2025-09-28T15:05:37.547962216+03:00",
      "updated_at": "0001-01-01T00:00:00Z",
      "artists": [
        {
          "artist_id": 3,
          "name": "Jpegmafia",
          "avatar_url": "image3.jpg",
          "created_at": "2025-09-28T15:05:37.547885952+03:00",
          "updated_at": "0001-01-01T00:00:00Z"
        }
      ],
      "genres": [
        {
          "genre_id": 1,
          "name": "Hip-Hop",
          "created_at": "2025-09-28T15:05:37.547863534+03:00"
        }
      ],
      "album": {
        "album_id": 6,
        "title": "Veteran",
        "avatar_url": "image16.jpg",
        "artist_id": 3,
        "artist": {
          "artist_id": 0,
          "name": "",
          "avatar_url": "",
          "created_at": "0001-01-01T00:00:00Z",
          "updated_at": "0001-01-01T00:00:00Z"
        },
        "release_date": "2018-01-19T00:00:00Z",
        "created_at": "2025-09-28T15:05:37.547928903+03:00",
        "updated_at": "0001-01-01T00:00:00Z"
      }
    },
    {
      "track_id": 6,
      "title": "Shoota",
      "duration_ms": 188000,
      "file_url": "carti_shoota.mp3",
      "created_at": "2025-09-28T15:05:37.547965638+03:00",
      "updated_at": "0001-01-01T00:00:00Z",
      "artists": [
        {
          "artist_id": 9,
          "name": "Playboi Carti",
          "avatar_url": "image9.jpg",
          "created_at": "2025-09-28T15:05:37.547905088+03:00",
          "updated_at": "0001-01-01T00:00:00Z"
        },
        {
          "artist_id": 10,
          "name": "The Weekend",
          "avatar_url": "image10.jpg",
          "created_at": "2025-09-28T15:05:37.54790851+03:00",
          "updated_at": "0001-01-01T00:00:00Z"
        }
      ],
      "genres": [
        {
          "genre_id": 1,
          "name": "Hip-Hop",
          "created_at": "2025-09-28T15:05:37.547863534+03:00"
        }
      ],
      "album": {
        "album_id": 9,
        "title": "Die Lit",
        "avatar_url": "image19.jpg",
        "artist_id": 9,
        "artist": {
          "artist_id": 0,
          "name": "",
          "avatar_url": "",
          "created_at": "0001-01-01T00:00:00Z",
          "updated_at": "0001-01-01T00:00:00Z"
        },
        "release_date": "2018-05-11T00:00:00Z",
        "created_at": "2025-09-28T15:05:37.547938051+03:00",
        "updated_at": "0001-01-01T00:00:00Z"
      }
    },
    {
      "track_id": 7,
      "title": "Baby I'm Bleeding",
      "duration_ms": 159000,
      "file_url": "peggy_baby_bleeding.mp3",
      "created_at": "2025-09-28T15:05:37.547968571+03:00",
      "updated_at": "0001-01-01T00:00:00Z",
      "artists": [
        {
          "artist_id": 3,
          "name": "Jpegmafia",
          "avatar_url": "image3.jpg",
          "created_at": "2025-09-28T15:05:37.547885952+03:00",
          "updated_at": "0001-01-01T00:00:00Z"
        }
      ],
      "genres": [
        {
          "genre_id": 1,
          "name": "Hip-Hop",
          "created_at": "2025-09-28T15:05:37.547863534+03:00"
        }
      ],
      "album": {
        "album_id": 6,
        "title": "Veteran",
        "avatar_url": "image16.jpg",
        "artist_id": 3,
        "artist": {
          "artist_id": 0,
          "name": "",
          "avatar_url": "",
          "created_at": "0001-01-01T00:00:00Z",
          "updated_at": "0001-01-01T00:00:00Z"
        },
        "release_date": "2018-01-19T00:00:00Z",
        "created_at": "2025-09-28T15:05:37.547928903+03:00",
        "updated_at": "0001-01-01T00:00:00Z"
      }
    },
    {
      "track_id": 8,
      "title": "Long Time",
      "duration_ms": 203000,
      "file_url": "carti_long_time.mp3",
      "created_at": "2025-09-28T15:05:37.547971923+03:00",
      "updated_at": "0001-01-01T00:00:00Z",
      "artists": [
        {
          "artist_id": 9,
          "name": "Playboi Carti",
          "avatar_url": "image9.jpg",
          "created_at": "2025-09-28T15:05:37.547905088+03:00",
          "updated_at": "0001-01-01T00:00:00Z"
        }
      ],
      "genres": [
        {
          "genre_id": 1,
          "name": "Hip-Hop",
          "created_at": "2025-09-28T15:05:37.547863534+03:00"
        }
      ],
      "album": {
        "album_id": 9,
        "title": "Die Lit",
        "avatar_url": "image19.jpg",
        "artist_id": 9,
        "artist": {
          "artist_id": 0,
          "name": "",
          "avatar_url": "",
          "created_at": "0001-01-01T00:00:00Z",
          "updated_at": "0001-01-01T00:00:00Z"
        },
        "release_date": "2018-05-11T00:00:00Z",
        "created_at": "2025-09-28T15:05:37.547938051+03:00",
        "updated_at": "0001-01-01T00:00:00Z"
      }
    },
    {
      "track_id": 9,
      "title": "Thug Tears",
      "duration_ms": 176000,
      "file_url": "peggy_thug_tears.mp3",
      "created_at": "2025-09-28T15:05:37.547975276+03:00",
      "updated_at": "0001-01-01T00:00:00Z",
      "artists": [
        {
          "artist_id": 3,
          "name": "Jpegmafia",
          "avatar_url": "image3.jpg",
          "created_at": "2025-09-28T15:05:37.547885952+03:00",
          "updated_at": "0001-01-01T00:00:00Z"
        }
      ],
      "genres": [
        {
          "genre_id": 1,
          "name": "Hip-Hop",
          "created_at": "2025-09-28T15:05:37.547863534+03:00"
        }
      ],
      "album": {
        "album_id": 6,
        "title": "Veteran",
        "avatar_url": "image16.jpg",
        "artist_id": 3,
        "artist": {
          "artist_id": 0,
          "name": "",
          "avatar_url": "",
          "created_at": "0001-01-01T00:00:00Z",
          "updated_at": "0001-01-01T00:00:00Z"
        },
        "release_date": "2018-01-19T00:00:00Z",
        "created_at": "2025-09-28T15:05:37.547928903+03:00",
        "updated_at": "0001-01-01T00:00:00Z"
      }
    },
    {
      "track_id": 10,
      "title": "FlatBed Freestyle",
      "duration_ms": 192000,
      "file_url": "carti_flatbed.mp3",
      "created_at": "2025-09-28T15:05:37.547978139+03:00",
      "updated_at": "0001-01-01T00:00:00Z",
      "artists": [
        {
          "artist_id": 9,
          "name": "Playboi Carti",
          "avatar_url": "image9.jpg",
          "created_at": "2025-09-28T15:05:37.547905088+03:00",
          "updated_at": "0001-01-01T00:00:00Z"
        }
      ],
      "genres": [
        {
          "genre_id": 1,
          "name": "Hip-Hop",
          "created_at": "2025-09-28T15:05:37.547863534+03:00"
        }
      ],
      "album": {
        "album_id": 9,
        "title": "Die Lit",
        "avatar_url": "image19.jpg",
        "artist_id": 9,
        "artist": {
          "artist_id": 0,
          "name": "",
          "avatar_url": "",
          "created_at": "0001-01-01T00:00:00Z",
          "updated_at": "0001-01-01T00:00:00Z"
        },
        "release_date": "2018-05-11T00:00:00Z",
        "created_at": "2025-09-28T15:05:37.547938051+03:00",
        "updated_at": "0001-01-01T00:00:00Z"
      }
    }
  ]}
    }
}

export const apiServise = new apiServises();