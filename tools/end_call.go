package tools

import (
	"context"
	"fmt"

	"github.com/modelcontextprotocol/go-sdk/mcp"
	"jordandavis.dev/phone-call-mcp-server/clients"
)

var endCallDef = &mcp.Tool{
	Name:        "EndCall",
	Description: "Ends an active phone call by its call ID.",
}

type endCallInput struct {
	CallId string `json:"callId" jsonschema:"The ID of the call to end."`
}

type endCallOutput struct {
	Result string
	Err    error
}

func EndCall(ctx context.Context, req *mcp.CallToolRequest, input endCallInput) (
	*mcp.CallToolResult,
	endCallOutput,
	error,
) {
	callId := input.CallId

	client := clients.NewTwilioClient()

	err := client.EndCall(callId)
	if err != nil {
		return nil, endCallOutput{}, err
	}

	result := fmt.Sprintf("Call %s successfully ended.", callId)

	return nil, endCallOutput{result, nil}, nil
}

func AddToolEndCall(server *mcp.Server) {
	mcp.AddTool(server, endCallDef, EndCall)
}
