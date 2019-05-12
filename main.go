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

// different messages
const (
	MSG_POINT     = 0
	MSG_SNAIL     = 1
	MSG_NEW_SNAIL = 2
	MSG_DED_SNAIL = 3
)

type SnailMsg interface {
	Pack() []byte
}

type MsgPoint struct {
	Point uint16
	Ang   uint16
	X     uint16
	Y     uint16
}

type MsgSnail struct {
	Id  uint32
	X   uint16
	Y   uint16
	Ang uint16
}

type MsgNewSnail struct {
	Id    uint32
	X     uint16
	Y     uint16
	Ang   uint16
	Color uint16
}

type MsgDedSnail struct {
	Id uint32
}

type Snail struct {
	Id    uint32
	Color uint16
	X     uint16
	Y     uint16
	Ang   uint16
	out   chan []uint8
}

// Globals
var snails []*Snail
var snails_mux = &sync.Mutex{}
var msgin chan SnailMsg
var idcounter uint32 = 1

func (mp MsgPoint) Pack() []byte {

}

func (mp MsgSnail) Pack() []byte {

}

func (mp MsgNewSnail) Pack() []byte {

}

func (mp MsgDedSnail) Pack() []byte {

}

func Unpack(p []byte, id uint32) (SnailMsg, error) {
	// unpack the binary message

}

// configure websocket upgrader
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func main() {
	var sitepath string = "./site"

	// set up the Globals
	snails = make([]*Snail, 0, 8)
	msgin = make(chan SnailMsg)

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
	c.out = make(chan []byte)

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
			msg, ok := <-c.out
			if !ok {
				break
			}

			ws.WriteMessage(websocket.BinaryMessage, msg)
		}
		log.Printf("%d is no longer sending\n", c.Id)
	}()

	// ReadMessage loop
	for {
		msgtype, p, err := ws.ReadMessage()
		if err != nil {
			log.Printf("ws Read error for client %d. %v\n", c.Id, err)
			break
		}

		switch msgtype {
		case websocket.TextMessage:
			log.Printf("Got a text message from %d?\n", c.Id)
		case websocket.BinaryMessage:
			// Got a message, unpack it and put it through the tube
			msg, err := Unpack(p, c.Id)
			if err != nil {
				log.Printf("Failed to unpack message from %d!\n", c.Id)
				break
			}
			msgin <- msg
		case websocket.CloseMessage:
			log.Printf("Got a close message from %d\n", c.Id)
			break
		case websocket.PingMessage:
			log.Printf("Ping %d\n", c.Id)
		case websocket.PongMessage:
			log.Printf("Pong %d\n", c.Id)
		}
	}

	// cleanup
	var ci int
	var found bool = false
	snails_mux.Lock()
	for ci = 0; ci < len(snails); ci++ {
		if snails[ci] == &c {
			found = true
			break
		}
	}

	if !found {
		log.Fatal("Could not remove client from the slice!\n")
	}

	snails = append(snails[:ci], snails[ci+1:]...)
	snails_mux.Unlock()

	close(c.out)

	log.Printf("Closed connection for %d\n", c.Id)

	// send out a player remove message
	msgin <- MsgDedSnail{c.Id}
}

func NewSpawn(c *Snail) error {
	c.X = uint16(rand.Intn(1000))
	c.Y = uint16(rand.Intn(1000))
	c.Ang = uint16(rand.Intn(360))
	return nil
}
