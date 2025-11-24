package tools

import (
	"context"
	"fmt"

	"github.com/modelcontextprotocol/go-sdk/mcp"
	"jordandavis.dev/phone-call-mcp-server/clients"
)

var startOutboundCallDef = &mcp.Tool{
	Name:        "StartCall",
	Description: "Starts an outbound phone call with a specified phone number.",
}

type startOutboundCallInput struct {
	PhoneNumber  string `json:"phoneNumber" jsonschema:"The phone number to dial out to."`
	DtfmSequence string `json:"dtfmSequence" jsonschema:"The sequence of digits to send after the call connects."`
}

type startOutboundCallOutput struct {
	Result string
	Err    error
}

func StartOutboundCall(ctx context.Context, req *mcp.CallToolRequest, input startOutboundCallInput) (
	*mcp.CallToolResult,
	startOutboundCallOutput,
	error,
) {
	phoneNumber := input.PhoneNumber
	dtfmSeq := input.DtfmSequence

	client := clients.NewTwilioClient()

	callId, err := client.StartCall(phoneNumber, &dtfmSeq)
	if err != nil {
		return nil, startOutboundCallOutput{}, err
	}

	result := fmt.Sprintf("Call with ID %s successfully started with %s.", callId, phoneNumber)

	return nil, startOutboundCallOutput{result, nil}, nil
}

func AddToolStartCall(server *mcp.Server) {
	mcp.AddTool(server, startOutboundCallDef, StartOutboundCall)
}
