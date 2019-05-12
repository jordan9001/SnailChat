package main

import (
	"log"
	"math/rand"
	"net/http"
	"os"
	"sync"

	"github.com/gorilla/websocket"
)

const PORT string = ":8160"

type CPoint struct {
	Point uint16
	Ang   uint16
	X     uint16
	Y     uint16
}

type Snail struct {
	Id    uint32
	Color uint16
	Font  string
	X     uint16
	Y     uint16
	Ang   uint16
	out   chan CPoint
}

// Globals
var snails []*Snail
var snails_mux = &sync.Mutex{}
var pointsin chan CPoint
var idcounter uint32

// configure websocket upgrader
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func main() {
	var sitepath string = "./site"

	// set up the Globals
	snails = make([]*Snail, 0, 8)
	pointsin = make(chan CPoint)

	if len(os.Args) > 1 {
		sitepath = os.Args[1]
	}

	http.HandleFunc("/ws", wsConnection)
	http.Handle("/", http.FileServer(http.Dir(sitepath)))
	log.Fatal(http.ListenAndServe(PORT, nil))
}

func wsConnection(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Error! Problem upgrading connection. err: %v\n", err)
		return
	}
	defer ws.Close()

	// Create a client and a channel
	var c Snail
	c.Color = 0x0
	c.out = make(chan CPoint)

	// give it a location to spawn
	err = NewSpawn(&c)
	if err != nil {
		log.Printf("Error getting spawn for new connection. err: %v\n", err)
		return
	}

	snails_mux.Lock()
	c.Id = idcounter
	idcounter++
	snails = append(snails, &c)
	snails_mux.Unlock()

	log.Printf("Connection for %d from %s\n", c.Id, r.RemoteAddr)
	log.Printf("There are %d connections\n", len(snails))

	// WriteMessage loop
	go func() {
		for {
			...
		}
	}()

	// ReadMessage loop
	for {
		...
	}
}

func NewSpawn(c *Snail) error {
	c.X = uint16(rand.Intn(1000))
	c.Y = uint16(rand.Intn(1000))
	c.Ang = uint16(rand.Intn(360))
	return nil
}
