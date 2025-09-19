package main

import (
	"log"
	"net/http"
	"os"
)

func main() {
	port, ok := os.LookupEnv("PORT")

	if !ok {
		log.Fatal("There is no server port defined")
		os.Exit(1)
	}

	mux := http.NewServeMux()

	mux.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	})

	log.Println("server listening on PORT:" + port)

	err := http.ListenAndServe(":"+port, mux)

	if err != nil {
		log.Fatal(err)
		os.Exit(1)
	}
}
