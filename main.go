package main

import (
	"context"
	"log"

	"github.com/modelcontextprotocol/go-sdk/mcp"
	"jordandavis.dev/phone-call-mcp-server/tools"
)

func main() {
	ctx := context.Background()

	server := mcp.NewServer(&mcp.Implementation{Name: "phone-call", Version: "0.0.1"}, nil)
	tools.AddToolStartOutboundCall(server)
	tools.AddToolEndCall(server)

	if err := server.Run(ctx, &mcp.StdioTransport{}); err != nil {
		log.Fatal(err)
	}
}
