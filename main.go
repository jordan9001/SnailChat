package main

import (
	"encoding/binary"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

const PORT string = ":8160"
const CHARMAP_STARTSZ = 0x4000

// different messages
const (
	MSG_POINT     = 0
	MSG_SNAIL     = 1
	MSG_NEW_SNAIL = 2
	MSG_DED_SNAIL = 3
)

// includeing type byte
// just for out msg
// in msg doesn't have Id
const (
	MSG_POINT_SZ     = 13
	MSG_SNAIL_SZ     = 9
	MSG_NEW_SNAIL_SZ = 11
	MSG_DED_SNAIL_SZ = 3
)

type SnailMsg interface {
	Pack() []byte
}

type MsgPoint struct {
	Id    uint16
	X     uint16
	Y     uint16
	Ang   uint16
	Color uint16
	Point uint16
	tstmp time.Time
}

type MsgSnail struct {
	Id  uint16
	X   uint16
	Y   uint16
	Ang uint16
}

type MsgNewSnail struct {
	Id    uint16
	X     uint16
	Y     uint16
	Ang   uint16
	Color uint16
}

type MsgDedSnail struct {
	Id uint16
}

type Snail struct {
	Id    uint16
	X     uint16
	Y     uint16
	Ang   uint16
	Color uint16
	out   chan []byte
}

// Globals
var snails []*Snail
var snails_mux = &sync.RWMutex{}
var msgin chan SnailMsg
var idcounter uint16 = 1
var charmap []*MsgPoint
var charmap_mux = &sync.RWMutex{}
var firsttime = time.Now()

func (m MsgPoint) Pack() []byte {
	b := make([]byte, MSG_POINT_SZ)
	b[0] = MSG_POINT
	binary.LittleEndian.PutUint16(b[1:], m.Id)
	binary.LittleEndian.PutUint16(b[3:], m.X)
	binary.LittleEndian.PutUint16(b[5:], m.Y)
	binary.LittleEndian.PutUint16(b[7:], m.Ang)
	binary.LittleEndian.PutUint16(b[9:], m.Color)
	binary.LittleEndian.PutUint16(b[11:], m.Point)

	return b
}

func (m MsgSnail) Pack() []byte {
	b := make([]byte, MSG_SNAIL_SZ)
	b[0] = MSG_SNAIL
	binary.LittleEndian.PutUint16(b[1:], m.Id)
	binary.LittleEndian.PutUint16(b[3:], m.X)
	binary.LittleEndian.PutUint16(b[5:], m.Y)
	binary.LittleEndian.PutUint16(b[7:], m.Ang)

	return b
}

func (m MsgNewSnail) Pack() []byte {
	b := make([]byte, MSG_NEW_SNAIL_SZ)
	b[0] = MSG_NEW_SNAIL
	binary.LittleEndian.PutUint16(b[1:], m.Id)
	binary.LittleEndian.PutUint16(b[3:], m.X)
	binary.LittleEndian.PutUint16(b[5:], m.Y)
	binary.LittleEndian.PutUint16(b[7:], m.Ang)
	binary.LittleEndian.PutUint16(b[9:], m.Color)

	return b
}

func (m MsgDedSnail) Pack() []byte {
	b := make([]byte, MSG_DED_SNAIL_SZ)
	b[0] = MSG_DED_SNAIL
	binary.LittleEndian.PutUint16(b[1:], m.Id)

	return b
}

func Unpack(p []byte, id uint16) (SnailMsg, error) {
	var err error = nil
	var s SnailMsg = nil
	// unpack the binary message
	msgtype := p[0]

	switch msgtype {
	case MSG_POINT:
		msgp := MsgPoint{}
		msgp.Id = id
		msgp.X = binary.LittleEndian.Uint16(p[1:])
		msgp.Y = binary.LittleEndian.Uint16(p[3:])
		msgp.Ang = binary.LittleEndian.Uint16(p[5:])
		msgp.Color = binary.LittleEndian.Uint16(p[7:])
		msgp.Point = binary.LittleEndian.Uint16(p[9:])
		msgp.tstmp = time.Now()
		s = msgp
	case MSG_SNAIL:
		msgs := MsgSnail{}
		msgs.Id = id
		msgs.X = binary.LittleEndian.Uint16(p[1:])
		msgs.Y = binary.LittleEndian.Uint16(p[3:])
		msgs.Ang = binary.LittleEndian.Uint16(p[5:])
		s = msgs
	case MSG_NEW_SNAIL:
		err = fmt.Errorf("Got new snail msg from a client? They can't do that!")
	case MSG_DED_SNAIL:
		err = fmt.Errorf("Got ded snail msg from a client? They can't do that!")
	default:
		err = fmt.Errorf("Unknown msg type!")
	}

	return s, err
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
	charmap = make([]*MsgPoint, 0, CHARMAP_STARTSZ)

	if len(os.Args) > 1 {
		sitepath = os.Args[1]
	}

	// start the distributor
	// If need better traffic? Can have multiple going
	go distributor()
	go charMapCleanup()

	http.HandleFunc("/ws", wsConnection)
	http.Handle("/", http.FileServer(http.Dir(sitepath)))
	log.Printf("Listening on port %v\n", PORT)
	log.Fatal(http.ListenAndServe(PORT, nil))
}

func distributor() {
	for {
		msg, ok := <-msgin
		if !ok {
			log.Printf("Distributor Closing")
			break
		}

		switch v := msg.(type) {
		case MsgPoint:
			// got a point, log it and send it out to all the clients
			// TODO store it to send it out to new arrivals
			log.Printf("Snail %d : %c (0x%x)\n", v.Id, v.Point, v.Point)
			msgbuf := v.Pack()
			snails_mux.RLock()
			for _, c := range snails {
				// don't send back to originator
				if c.Id != v.Id {
					c.out <- msgbuf
				}
			}
			snails_mux.RUnlock()
			charmap_mux.Lock()
			charmap = append(charmap, &v)
			charmap_mux.Unlock()
		case MsgSnail:
			// Snail moved, log it and send it out to all the clients
			msgbuf := v.Pack()
			snails_mux.RLock()
			for _, c := range snails {
				// don't send back to originator
				if c.Id != v.Id {
					c.out <- msgbuf
				} else {
					// but do update their position
					c.X = v.X
					c.Y = v.Y
					c.Ang = v.Ang
				}
			}
			snails_mux.RUnlock()
		case MsgNewSnail:
			// New snail!
			msgbuf := v.Pack()
			snails_mux.RLock()
			for _, c := range snails {
				if c.Id != v.Id {
					c.out <- msgbuf
				} else {
					// originator needs one with a NULL ID
					// begin sending them everything they missed
					go catchUp(c)
				}
			}
			snails_mux.RUnlock()
		case MsgDedSnail:
			// Snail died, send it out to all the clients
			msgbuf := v.Pack()
			snails_mux.RLock()
			for _, c := range snails {
				// don't send back to originator (shouldn't be in snails anyways)
				if c.Id != v.Id {
					c.out <- msgbuf
				}
			}
			snails_mux.RUnlock()
		}
	}
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
	if idcounter == 0 {
		idcounter++
	}
	snails = append(snails, &c)
	snails_mux.Unlock()

	log.Printf("Connection for %d from %s at %d %d\n", c.Id, r.RemoteAddr, c.X, c.Y)
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

	// send out a MSG_NEW_SNAIL
	// the distributor will do the catching up the new snail needs too
	msgin <- MsgNewSnail{c.Id, c.X, c.Y, c.Ang, c.Color}

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

func catchUp(c *Snail) {
	// first send them all the snail info
	snails_mux.RLock()
	// only do this if we are still in the map
	inlist := false
	for i := len(snails) - 1; i >= 0; i-- {
		if c == snails[i] {
			inlist = true
			break
		}
	}
	if !inlist {
		log.Printf("Trying to catch up a snail that is already gone\n")
		snails_mux.RUnlock()
		return
	}
	for _, sn := range snails {
		newsnailmsg := MsgNewSnail{sn.Id, sn.X, sn.Y, sn.Ang, sn.Color}
		if sn == c {
			newsnailmsg.Id = 0
		}
		c.out <- newsnailmsg.Pack()
	}
	snails_mux.RUnlock()

	seensince := time.Now()
	seenfirst := firsttime
	
	foundnotsent := false

	// Send previously sent letters, maybe with some delay
	for {
		charmap_mux.RLock()
		// go through the list backwards, until we find one we haven't seensince
		// might miss a few in the gaps, oh well
		foundnotsent = false
		for i := 0; i < len(charmap); i++ {
			if charmap[i].tstmp.After(seensince) {
				// done
				break
			}
			if charmap[i].tstmp.After(seenfirst) {
				foundnotsent = true
				seenfirst = charmap[i].tstmp
				// only send if we are still in the mux
				snails_mux.RLock()

				inlist := false
				for i := len(snails) - 1; i >= 0; i-- {
					if c == snails[i] {
						inlist = true
						break
					}
				}
				if !inlist {
					log.Printf("Trying to catch up a snail that is already gone\n")
					snails_mux.RUnlock()
					charmap_mux.RUnlock()
					return
				}
				c.out <- charmap[i].Pack()

				snails_mux.RUnlock()
				break
			}
		}
		charmap_mux.RUnlock()
		if !foundnotsent {
			break
		}
		time.Sleep(time.Millisecond * 1)
	}
}

func NewSpawn(c *Snail) error {
	//c.X = uint16(rand.Intn(1200))
	//c.Y = uint16(rand.Intn(900))

	c.X = 0
	c.Y = 0
	c.Ang = uint16(rand.Intn(360))
	// random 16 bit color with no high bits set
	c.Color = uint16((rand.Intn(0xf) << 11) | (rand.Intn(0x1f) << 5) | (rand.Intn(0xf)))
	return nil
}

func charMapCleanup() {
	//TODO dry up old paths when we hit a limit
}
