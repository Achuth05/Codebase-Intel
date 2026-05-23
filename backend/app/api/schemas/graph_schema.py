from pydantic import BaseModel

class FileSymbolsResponse(BaseModel):
    file: str
    functions: list[str]
    classes: list[str]
    imports: list[str]

class ImportedByResponse(BaseModel):
    module: str
    imported_by: list[str]

class MostImportedResponse(BaseModel):
    most_imported: list[dict]

class FunctionsResponse(BaseModel):
    functions: list[dict]

class ClassesResponse(BaseModel):
    classes: list[dict]